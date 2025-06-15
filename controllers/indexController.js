// Sample data - in a real app, this would come from a database or service
const menu_data = [
    { me_link: '/', me_target: 'self', me_name: '홈', sub: [] },
    {
        me_link: '/bbs/board.php?bo_table=notice',
        me_target: 'self',
        me_name: '공지사항',
        sub: [
            { me_link: '/bbs/board.php?bo_table=notice&sca=info', me_target: 'self', me_name: '정보' },
            { me_link: '/bbs/board.php?bo_table=notice&sca=event', me_target: 'self', me_name: '이벤트' },
        ]
    },
    { me_link: '/bbs/board.php?bo_table=free', me_target: 'self', me_name: '자유게시판', sub: [] },
    { me_link: '/shop/list.php?ca_id=10', me_target: 'self', me_name: '쇼핑몰', sub: [] },
];

const popular_keywords_sample = [
    { pp_word: '인기검색어1' },
    { pp_word: 'ยอดนิยม2' }, // Example with other language
    { pp_word: ' হিট3' },
];

const latest_notice_sample = [
    { href: '/bbs/board.php?bo_table=notice&wr_id=10', subject: '첫번째 공지입니다.'},
    { href: '/bbs/board.php?bo_table=notice&wr_id=9', subject: '두번째 공지입니다. 길게 써봅니다. 아주 길게 써봅니다.'},
    { href: '/bbs/board.php?bo_table=notice&wr_id=8', subject: '세번째 공지.'},
];

const visit_stats_sample = {
    today: 123,
    yesterday: 456,
    max: 1023,
    total: 100234
};

const db = require('../models');

// Helper function to fetch latest posts
// Note: This is a simplified version. Error handling, dynamic table/model handling,
// and more complex queries would be needed for a full implementation.
async function fetchLatest(boardTableName, limit = 5, subjectLen = 40) {
    // Construct model name, e.g., G5WriteFree, G5WriteNotice
    const modelName = `G5Write${boardTableName.charAt(0).toUpperCase() + boardTableName.slice(1)}`;

    if (!db[modelName]) {
        console.warn(`Model ${modelName} not found. Ensure it is defined and loaded in models/index.js. Skipping latest for ${boardTableName}.`);
        return [];
    }

    try {
        const posts = await db[modelName].findAll({
            where: {
                wr_is_comment: 0, // Assuming 0 means not a comment
            },
            order: [['wr_num', 'ASC'], ['wr_reply', 'ASC']], // wr_num DESC or wr_datetime DESC is more common for latest
                                                           // GNUBoard uses complex ordering (notice first, then by wr_num, wr_reply)
                                                           // This example uses a simplified ordering.
            limit: limit,
            attributes: [
                'wr_id',
                'wr_subject',
                'wr_datetime',
                'wr_comment', // To show comment count
                'ca_name',    // Category name if used
                // Add other attributes needed for display, e.g., wr_name for author
            ]
        });

        return posts.map(post => ({
            id: post.wr_id,
            subject: post.wr_subject.substring(0, subjectLen) + (post.wr_subject.length > subjectLen ? '...' : ''),
            datetime: post.wr_datetime,
            comment_cnt: post.wr_comment,
            category: post.ca_name,
            // Construct link, assuming a structure like /board/{tableName}/{wr_id}
            // This needs to be adapted to your actual routing structure.
            href: `/bbs/board.php?bo_table=${boardTableName}&wr_id=${post.wr_id}`
        }));
    } catch (error) {
        console.error(`Error fetching latest posts for ${boardTableName}:`, error);
        return [];
    }
}


exports.home = async (req, res) => {
    // These variables would normally be fetched from DB or session
    // For testing, check query params
    const isLoggedIn = req.query.is_member === 'true';
    const isAdmin = req.query.is_admin === 'true';
    const memberNick = isLoggedIn ? (isAdmin ? '관리자님' : '회원님') : '손님';


    // Fetch latest posts for different boards
    // These table names should match your g5_write_xxxx tables
    const latest_free = await fetchLatest('free', 5, 30);
    const latest_notice = await fetchLatest('notice', 4, 25);
    const latest_gallery = await fetchLatest('gallery', 8, 20);
    const latest_qa = await fetchLatest('qa', 4, 23); // Fetch for Q&A

    // Fetch other boards for the main page (excluding notice, gallery)
    let other_boards_latest = [];
    try {
        const boards = await db.G5Board.findAll({
            where: {
                bo_device: { [db.Sequelize.Op.in]: ['both', 'pc'] }, // Not mobile only
                bo_table: { [db.Sequelize.Op.notIn]: ['notice', 'gallery', 'free', 'qa'] }, // Exclude already fetched
                // Add G5_COMMUNITY_USE equivalent if needed
                // Add bo_use_cert condition for non-admins if needed
            },
            include: [{
                model: db.G5Group,
                attributes: ['gr_order'], // For ordering
            }],
            order: [
                [db.G5Group, 'gr_order', 'ASC'], // Order by group order
                ['bo_order', 'ASC'],             // Then by board order
            ],
            // attributes: ['bo_table', 'bo_subject'] // Only fetch needed attributes
        });

        for (const board of boards) {
            const items = await fetchLatest(board.bo_table, 6, 24);
            if (items && items.length > 0) {
                other_boards_latest.push({
                    bo_table: board.bo_table,
                    title: board.bo_subject || board.bo_table, // Use board subject as title
                    items: items,
                });
            }
        }
    } catch (error) {
        console.error("Error fetching other boards:", error);
    }

    // Placeholder for shop items (hit items, etc.)
    // This would typically come from a shopController or a dedicated service
    let shop_hit_items = [];
    // Example: try to fetch if G5ShopItem model exists
    if (db.G5ShopItem) {
        try {
            shop_hit_items = await db.G5ShopItem.findAll({
                where: {
                    it_use: 1, // Item is in use
                    it_type1: 1, // Example: Hit item flag it_type1 = true
                },
                limit: 5, // Number of hit items to display
                order: [['it_id', 'DESC']], // Example ordering
                 attributes: ['it_id', 'it_name', 'it_price', /*'it_img1'*/] // Assuming it_img1 for image
                // TODO: Figure out how to get it_img1, it's not in the model by default
            });
             // Manually add image path for example, as it_img is not in the model
            shop_hit_items = shop_hit_items.map(item => ({
                ...item.toJSON(),
                // it_img1: `/data/item/${item.it_id}_s.jpg` // Example path, adapt to your file structure
                // Actual image path construction would be more complex based on GNUBoard logic
                it_img1: `/img/no_img.png` // Placeholder if image path logic is complex
            }));

        } catch (error) {
            console.error("Error fetching shop hit items:", error)
        }
    }


    // Fetch active popups (newwin)
    let activePopups = [];
    if (db.G5NewWin) { // Assuming a G5NewWin model exists
        try {
            const now = new Date();
            activePopups = await db.G5NewWin.findAll({
                where: {
                    nw_begin_time: { [db.Sequelize.Op.lte]: now },
                    nw_end_time: { [db.Sequelize.Op.gte]: now },
                    nw_device: { [db.Sequelize.Op.in]: ['both', 'pc'] } // Assuming non-mobile for now
                }
            });
        } catch (error) {
            console.error("Error fetching popups:", error);
        }
    }


    res.render('index', {
        title: '메인 페이지',
        latest_free: latest_free,
        latest_notice_data: latest_notice,
        latest_gallery: latest_gallery,
        latest_qa: latest_qa,
        other_boards_latest: other_boards_latest,
        shop_hit_items: shop_hit_items, // Pass shop items to the view
        active_popups: activePopups,
        is_index: true, // To control elements specific to the index page in layout/header
        // Data for header/footer partials (some might be from DB like config)
        g5_title: '나의 멋진 웹사이트',
        config_cf_title: '나의 멋진 웹사이트',
        g5_url: '/',
        g5_bbs_url: '/bbs',
        g5_shop_url: '/shop',
        g5_community_use: true,
        g5_use_shop: true,
        connect_count: visit_stats_sample.today, // Example: show today's visitors
        popular_keywords: popular_keywords_sample,
        is_member: isLoggedIn,
        is_admin: isAdmin,
        member_nick: memberNick,
        g5_admin_url: '/adm',
        menu_data: menu_data, // Pass menu data to navigation partial
        outlogin_skin: null, // Placeholder for actual outlogin skin HTML
        poll_skin: null,     // Placeholder for actual poll skin HTML
        poll: { po_id: 1, po_subject: '가장 좋아하는 계절은?', po_poll1: '봄', po_poll2: '여름', po_poll3: '가을', po_poll4: '겨울'}, // Sample poll data

        // Sample data for footer
        company_name: 'My Awesome Company',
        company_owner: 'John Doe',
        company_address: '123 Main St, Anytown, USA',
        company_saupja_no: '123-45-67890',
        company_tel: '02-123-4567',
        company_fax: '02-123-4568',
        tongsin_no: '제2024-서울강남-00000호',
        info_name: '개인정보관리자 (admin@example.com)',
        latest_notice: latest_notice_sample,
        visit_stats: visit_stats_sample,
        domain: 'example.com',

        // For layout.ejs specific vars
        isMobile: false, // Determine if mobile view
        // add_script: '<script>console.log("Additional script loaded!");</script>', // Example
        // config: { cf_add_script: '<script>console.log("Config additional script!");</script>', cf_analytics: '<!-- Google Analytics -->'}, // Example
        page_title: '메인 페이지', // for container_title
    });
};
