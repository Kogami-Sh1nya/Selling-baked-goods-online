import {body} from 'express-validator'; import {q} from '../config/db.js';
export const reviewRules=[body('rating').isInt({min:1,max:5}),body('comment').trim().isLength({min:3})];
export async function addReview(req,res){const {rows}=await q('INSERT INTO reviews(product_id,user_id,rating,comment,is_verified_purchase) VALUES($1,$2,$3,$4,EXISTS(SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE o.user_id=$2 AND oi.product_id=$1)) RETURNING *',[req.params.productId,req.user.id,req.body.rating,req.body.comment]); res.status(201).json(rows[0]);}
export async function deleteReview(req,res){await q('DELETE FROM reviews WHERE id=$1',[req.params.id]); res.json({message:'Отзыв удалён'});}
