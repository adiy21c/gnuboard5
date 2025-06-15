const db = require('../models'); // If you need to fetch data like menu from DB

// Sample data - in a real app, this would come from a database or service
const menu_data_sample = [
    { me_link: '/', me_target: 'self', me_name: '홈', sub: [] },
    {
        me_link: '/board/notice', // Updated link
        me_target: 'self',
        me_name: '공지사항',
        sub: [
            { me_link: '/board/notice?sca=info', me_target: 'self', me_name: '정보' },
            { me_link: '/board/notice?sca=event', me_target: 'self', me_name: '이벤트' },
        ]
    },
    { me_link: '/board/free', me_target: 'self', me_name: '자유게시판', sub: [] },
    // Add other menu items as needed
];

const popular_keywords_sample = [ { pp_word: '샘플키워드1' }, { pp_word: '샘플키워드2' }];
const latest_notice_sample_for_layout = [ { href: '/board/notice/1', subject: '레이아웃 공지1'}, { href: '/board/notice/2', subject: '레이아웃 공지2'}]; // Example IDs
const visit_stats_sample = { today: 10, yesterday: 20, max: 100, total: 1000 };


async function commonDataMiddleware(req, res, next) {
    // 1. Authentication status
    if (req.session.user) {
        req.is_member = true;
        // Assuming mb_level 10 is admin, adjust if different
        req.is_admin = req.session.user.mb_level === 10;
        res.locals.member = req.session.user; // Full member object from session
    } else {
        req.is_member = false;
        req.is_admin = false;
        res.locals.member = null; // No member object if not logged in
    }
    res.locals.is_member = req.is_member;
    res.locals.is_admin = req.is_admin;


    // 2. Menu Data (can be fetched from DB using G5Menu model if it exists)
    // For now, using sample. In a real app, you'd query db.G5Menu
    req.menu_data = menu_data_sample;
    res.locals.menu_data = req.menu_data; // For direct use in layout

    // 3. Other common data for layout (header/footer)
    // These can be fetched from a config table (G5Config) or set as defaults
    res.locals.g5_title = process.env.APP_TITLE || 'GNUBoard.JS'; // Site title from .env or default
    res.locals.config_cf_title = process.env.APP_TITLE || 'GNUBoard.JS';
    res.locals.g5_url = '/';
    res.locals.g5_bbs_url = '/board'; // Changed from /bbs to /board to match new routes
    res.locals.g5_shop_url = '/shop'; // Assuming a shop route
    res.locals.g5_admin_url = '/adm';

    // Simulate data that might come from DB for layout (e.g. from G5Config, G5Popular, etc.)
    req.popular_keywords = popular_keywords_sample;
    res.locals.popular_keywords = req.popular_keywords;

    req.latest_notice = latest_notice_sample_for_layout; // For footer/aside notices
    res.locals.latest_notice = req.latest_notice;

    req.visit_stats = visit_stats_sample;
    res.locals.visit_stats = req.visit_stats;

    // For layout.ejs specific template variables (already in res.locals but can be explicit)
    res.locals.isMobile = req.query.mobile === 'true'; // Simple mobile check for testing
    res.locals.is_index = req.path === '/'; // Check if current page is index

    // Variables that boardController might expect on req, also set to res.locals for direct template access
    res.locals.member_level = req.is_member ? req.session.user.mb_level : 1; // Guest level is 1
    res.locals.qstr = ''; // Placeholder for query string, can be built from req.query

    // Default values for company info for footer (can come from config DB)
    res.locals.company_name = 'My Node.js Company';
    res.locals.company_owner = 'Node CEO';
    // ... other footer variables used in layout.ejs and footer.ejs

    next();
}

module.exports = commonDataMiddleware;
