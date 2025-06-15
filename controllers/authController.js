const db = require('../models');
const passwordUtils = require('../lib/passwordUtils'); // Will be created later
const { Op } = require('sequelize');

// Show login form
exports.showLoginForm = (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    // Pass any error messages if redirected from a failed login attempt
    res.render('member/login', {
        title: '로그인',
        error: req.flash ? req.flash('error') : [], // Using connect-flash or similar for error messages
                                                 // For now, this will be empty.
        // Common layout variables are provided by commonDataMiddleware
    });
};

// Show registration terms page
exports.showRegistrationTerms = (req, res) => {
    // In a real app, fetch terms content from DB (g5_config table or content table)
    const termsContent = "회원가입 약관 내용입니다. (이 내용은 실제 DB에서 가져와야 합니다.)";
    const privacyPolicyContent = "개인정보 처리방침 내용입니다. (이 내용은 실제 DB에서 가져와야 합니다.)";

    res.render('member/register', {
        title: '회원가입 약관',
        termsContent: termsContent,
        privacyPolicyContent: privacyPolicyContent,
        error: req.flash('error'),
    });
};

// Handle registration terms agreement
exports.handleRegistrationTerms = (req, res) => {
    const { agree, agree2 } = req.body;
    if (agree && agree2) {
        req.session.termsAgreed = true;
        res.redirect('/auth/register-form');
    } else {
        req.flash('error', '모든 약관에 동의하셔야 회원가입을 진행할 수 있습니다.');
        res.redirect('/auth/register');
    }
};

// Show registration form page
exports.showRegistrationForm = (req, res) => {
    if (!req.session.termsAgreed) {
        req.flash('error', '약관에 먼저 동의해주세요.');
        return res.redirect('/auth/register');
    }
    // Destroy the termsAgreed session variable so user has to agree again if they navigate away
    // delete req.session.termsAgreed; // Or keep it until registration is complete

    res.render('member/register_form', {
        title: '회원가입',
        error: req.flash('error'),
        // Pass any form data back if validation failed and redirected
        formData: req.flash('formData')[0] || {},
    });
};

// Handle user registration
exports.registerUser = async (req, res, next) => {
    if (!req.session.termsAgreed) {
        req.flash('error', '약관 동의가 확인되지 않았습니다.');
        return res.redirect('/auth/register');
    }

    try {
        const {
            mb_id, mb_password, mb_password_re, mb_name, mb_nick, mb_email,
            mb_homepage, mb_tel, mb_hp, mb_zip1, mb_zip2, mb_addr1, mb_addr2, mb_addr3, mb_addr_jibeon,
            mb_signature, mb_profile, mb_recommend,
            mb_mailling, mb_sms, mb_open
        } = req.body;

        // --- Basic Validation ---
        if (!mb_id || !mb_password || !mb_password_re || !mb_name || !mb_nick || !mb_email) {
            req.flash('error', '필수 항목을 모두 입력해주세요.');
            req.flash('formData', req.body);
            return res.redirect('/auth/register-form');
        }
        if (mb_password !== mb_password_re) {
            req.flash('error', '비밀번호가 일치하지 않습니다.');
            req.flash('formData', req.body);
            return res.redirect('/auth/register-form');
        }
        // Add more specific validations (length, format, etc.) as in original PHP

        // --- Duplicate Checks (server-side) ---
        let existingUser = await db.G5Member.findOne({ where: { mb_id } });
        if (existingUser) {
            req.flash('error', '이미 사용중인 아이디입니다.');
            req.flash('formData', req.body);
            return res.redirect('/auth/register-form');
        }
        existingUser = await db.G5Member.findOne({ where: { mb_nick } });
        if (existingUser) {
            req.flash('error', '이미 사용중인 닉네임입니다.');
            req.flash('formData', req.body);
            return res.redirect('/auth/register-form');
        }
        existingUser = await db.G5Member.findOne({ where: { mb_email } });
        if (existingUser) {
            req.flash('error', '이미 사용중인 이메일입니다.');
            req.flash('formData', req.body);
            return res.redirect('/auth/register-form');
        }

        // --- Hash Password ---
        const hashedPassword = await passwordUtils.hashPassword(mb_password);

        // --- Create User ---
        const newUser = await db.G5Member.create({
            mb_id,
            mb_password: hashedPassword,
            mb_name,
            mb_nick,
            mb_email,
            mb_homepage: mb_homepage || '',
            mb_tel: mb_tel || '',
            mb_hp: mb_hp || '',
            mb_zip1: mb_zip1 || '',
            mb_zip2: mb_zip2 || '',
            mb_addr1: mb_addr1 || '',
            mb_addr2: mb_addr2 || '',
            mb_addr3: mb_addr3 || '',
            mb_addr_jibeon: mb_addr_jibeon || '',
            mb_signature: mb_signature || '',
            mb_profile: mb_profile || '',
            mb_recommend: mb_recommend || '',
            mb_mailling: mb_mailling ? 1 : 0,
            mb_sms: mb_sms ? 1 : 0,
            mb_open: mb_open ? 1 : 0,
            mb_level: 2, // Default member level, adjust as per config
            mb_ip: req.ip,
            mb_datetime: new Date(),
            mb_today_login: new Date(), // First login is registration time
            mb_nick_date: new Date(),   // Nickname set date
            mb_open_date: new Date(),   // Profile open date
            // mb_email_certify, mb_adult, etc. need specific logic
        });

        // --- Point Logic ---
        // Placeholder config values, these should be fetched from G5Config model or .env
        const cf_use_point = true; // Assuming points are used
        const cf_recommend_point = 100; // Example recommendation points
        const cf_register_point = 50;   // Example registration points

        if (cf_use_point) {
            let current_mb_point = 0;

            // Recommendation points
            if (mb_recommend && cf_recommend_point > 0) {
                const recommender = await db.G5Member.findOne({ where: { mb_id: mb_recommend } });
                if (recommender) {
                    recommender.mb_point += cf_recommend_point;
                    await recommender.save();
                    await db.G5Point.create({
                        mb_id: mb_recommend,
                        po_datetime: new Date(),
                        po_content: `${newUser.mb_nick}(${newUser.mb_id})님의 회원가입 추천`,
                        po_point: cf_recommend_point,
                        po_mb_point: recommender.mb_point,
                        po_rel_table: '@member',
                        po_rel_id: newUser.mb_id,
                        po_rel_action: 'recommend',
                    });
                }
            }

            // Registration points for new user
            if (cf_register_point > 0) {
                current_mb_point += cf_register_point;
                await db.G5Point.create({
                    mb_id: newUser.mb_id,
                    po_datetime: new Date(),
                    po_content: '회원가입 축하',
                    po_point: cf_register_point,
                    po_mb_point: current_mb_point, // Initial point for the new user
                    po_rel_table: '@member',
                    po_rel_id: newUser.mb_id,
                    po_rel_action: 'register',
                });
            }

            if (current_mb_point !== 0) {
                 await newUser.update({ mb_point: current_mb_point });
            }
        }

        // Auto-login the new user
        req.session.user = {
            mb_no: newUser.mb_no,
            mb_id: newUser.mb_id,
            mb_name: newUser.mb_name,
            mb_nick: newUser.mb_nick,
            mb_level: newUser.mb_level,
        };

        delete req.session.termsAgreed; // Clear terms agreement from session

        res.redirect('/auth/register-result');

    } catch (error) {
        console.error("Registration error:", error);
        req.flash('error', '회원가입 중 오류가 발생했습니다.');
        req.flash('formData', req.body);
        // return res.redirect('/auth/register-form');
        next(error); // Pass to error handler for now
    }
};

// Show registration result page
exports.showRegistrationResult = (req, res) => {
    if (!req.session.user) { // Should be logged in after registration
        return res.redirect('/auth/login');
    }
    res.render('member/register_result', {
        title: '회원가입 완료',
        member: req.session.user,
    });
};

// AJAX field checks
exports.checkUserid = async (req, res) => {
    try {
        const { mb_id } = req.body;
        if (!mb_id || mb_id.length < 3) { // Basic validation
            return res.json({ available: false, message: '3자 이상 입력해주세요.' });
        }
        // Add more validation rules from GNUBoard (e.g., allowed characters)
        const count = await db.G5Member.count({ where: { mb_id } });
        if (count > 0) {
            return res.json({ available: false, message: '이미 사용중인 아이디입니다.' });
        }
        return res.json({ available: true, message: '사용 가능한 아이디입니다.' });
    } catch (error) {
        console.error("checkUserid error:", error);
        return res.status(500).json({ available: false, message: '서버 오류가 발생했습니다.' });
    }
};

exports.checkNickname = async (req, res) => {
    try {
        const { mb_nick } = req.body;
        if (!mb_nick || mb_nick.length < 2) {
            return res.json({ available: false, message: '2자 이상 입력해주세요.' });
        }
        const count = await db.G5Member.count({ where: { mb_nick } });
        if (count > 0) {
            return res.json({ available: false, message: '이미 사용중인 닉네임입니다.' });
        }
        return res.json({ available: true, message: '사용 가능한 닉네임입니다.' });
    } catch (error) {
        console.error("checkNickname error:", error);
        return res.status(500).json({ available: false, message: '서버 오류가 발생했습니다.' });
    }
};

exports.checkEmail = async (req, res) => {
    try {
        const { mb_email } = req.body;
        // Basic email format validation
        if (!mb_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mb_email)) {
            return res.json({ available: false, message: '유효한 이메일 주소를 입력해주세요.' });
        }
        const count = await db.G5Member.count({ where: { mb_email } });
        if (count > 0) {
            return res.json({ available: false, message: '이미 사용중인 이메일입니다.' });
        }
        return res.json({ available: true, message: '사용 가능한 이메일입니다.' });
    } catch (error) {
        console.error("checkEmail error:", error);
        return res.status(500).json({ available: false, message: '서버 오류가 발생했습니다.' });
    }
};

// Handle login attempt
exports.login = async (req, res, next) => {
    try {
        const { mb_id, mb_password } = req.body;

        if (!mb_id || !mb_password) {
            req.flash('error', '아이디와 비밀번호를 입력해주세요.');
            return res.status(400).redirect('/auth/login');
        }

        const member = await db.G5Member.findOne({ where: { mb_id } });

        if (!member) {
            req.flash('error', '존재하지 않는 아이디입니다.');
            return res.status(401).redirect('/auth/login');
        }

        // Verify password using the ported GNUBoard hash function
        const isValidPassword = await passwordUtils.verifyPassword(mb_password, member.mb_password);

        if (isValidPassword) {
            // Login successful
            req.session.user = {
                mb_no: member.mb_no,
                mb_id: member.mb_id,
                mb_name: member.mb_name,
                mb_nick: member.mb_nick,
                mb_level: member.mb_level,
                // Add other necessary member details to session
            };

            // Update mb_today_login and mb_login_ip (simplified)
            try {
                member.mb_today_login = new Date();
                member.mb_login_ip = req.ip; // Ensure you have ip middleware if this is not standard
                await member.save();
            } catch (updateError) {
                console.error("Error updating member login info:", updateError);
                // Non-critical error, proceed with login
            }

            // TODO: Implement point system for login if needed
            // Example: await giveLoginPoint(member);

            const redirectUrl = req.query.redirect || '/';
            res.redirect(redirectUrl);

        } else {
            // Login failed
            req.flash('error', '아이디 또는 비밀번호가 일치하지 않습니다.');
            return res.status(401).redirect('/auth/login');
        }

    } catch (error) {
        console.error("Login error:", error);
        next(error);
    }
};

// Handle logout
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
            return res.redirect('/'); // Or an error page
        }
        res.clearCookie('connect.sid'); // Default session cookie name, might vary
        res.redirect('/');
    });
};
