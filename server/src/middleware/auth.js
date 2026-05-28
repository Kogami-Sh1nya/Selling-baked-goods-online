import jwt from 'jsonwebtoken';
export function auth(req,res,next){const h=req.headers.authorization||''; const t=h.startsWith('Bearer ')?h.slice(7):null; if(!t) return res.status(401).json({message:'Требуется авторизация'}); try{req.user=jwt.verify(t,process.env.JWT_SECRET); next();}catch{return res.status(401).json({message:'Недействительный токен'});} }
export const allow=(...roles)=>(req,res,next)=> roles.includes(req.user?.role)?next():res.status(403).json({message:'Недостаточно прав'});
