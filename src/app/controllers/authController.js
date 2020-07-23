const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const router = express.Router();


function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

//Cadastrar
router.post('/register', async (req, res) => {
    const { email } = req.body;


    try {

        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'User alredy exists' });

        const user = await User.create(req.body);

        user.password = undefined;


        res.send({
            user,
            token: generateToken({ id: user.id }),
        });

    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' });
    }
});

//Autenticar 
router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(401).send({ error: 'User not found' });

    if (!await bcrypt.compare(password, user.password))
        return res.status(401).send({ error: 'Invalid password' });

    user.password = undefined;




    res.send({
        user,
        token: generateToken({ id: user.id }),
    });
});


//Esqueceu a senha
//enviar email com token
router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        //criar token com duração para apenas o usuario poder resetar a senha
        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExperires: now,
            }
        });

        //console.log(token, now);
        const link = "http://localhost:3000/reset-password?" + "e=" + email + "&t=" + token;

        mailer.sendMail({
            to: email,
            from: 'contato-luiz-gustavo@outlook.com',
            template: 'auth/forgot_password',
            context: { token, email, link },
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Cannot send forgot password email' })

            return res.send();
        })



    } catch (error) {
        res.status(400).send({ error: 'Erro on forgot password, try again' });
    }
});

//Resetar senha/enviar nova senha
router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExperires');

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token invalid' });

        const now = new Date();
        if (now > user.passwordResetExperires)
            return res.status(400).send({ error: 'Token expired, generate a new one' });

        user.password = password;

        await user.save();

        res.send();

    } catch (error) {
        console.log(error)
        res.status(400).send({ error: 'Cannot reset password, try again' });
    }
});

module.exports = app => app.use('/auth', router);