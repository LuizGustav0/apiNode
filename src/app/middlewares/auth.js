const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    //Verifica se existe o token na requisição
    // status=401 acesso não autorizado
    if(!authHeader)
        return res.status(401).send({ error: 'No token provided'});

    const parts = authHeader.split(' ');

    if(!parseInt.length === 2)
        return res.status(401).send({ error: 'Token error'});

    const [ scheme, token] = parts;

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send({ error: 'Token malformatted'});
    
    jwt.verify(token, authConfig.secret, (error, decoded) =>{
        if(error) return res.status(401).send({ error: 'Token invalid'});

        req.userId = decoded.id;
        return next();
    });


    
};