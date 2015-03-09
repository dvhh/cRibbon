// all math from http://en.wikipedia.org/wiki/Cubic_Hermite_spline
function curve(p0:Sprite, p1:Sprite, p2:Sprite, p3:Sprite, rez:Number=.02):void{
    var px:Number = 0;
    var py:Number = 0;
    var m0:Point = tangent(p1, p0);
    var m1:Point = tangent(p2, p0);
    var m2:Point = tangent(p3, p1);
    var m3:Point = tangent(p3, p2);
   
    for (var t:Number = 0; t <1; t+=rez){
         var t_2:Number = t * t;
         var _1_t:Number = 1 - t;
         var _2t:Number = 2 * t;
         
         var h00:Number =  (1 + _2t) * (_1_t) * (_1_t);
         var h10:Number =  t  * (_1_t) * (_1_t);
         var h01:Number =  t_2 * (3 - _2t);
         var h11:Number =  t_2 * (t - 1);
         
         px = h00 * p0.x + h10 * m0.x + h01 * p1.x + h11 * m1.x;
         py = h00 * p0.y + h10 * m0.y + h01 * p1.y + h11 * m1.y;
         canvas.setPixel(px, py, 0xFFFFFF);
         
         px = h00 * p1.x + h10 * m1.x + h01 * p2.x + h11 * m2.x;
         py = h00 * p1.y + h10 * m1.y + h01 * p2.y + h11 * m2.y;
         canvas.setPixel(px, py, 0xFFFFFF);
         
         px = h00 * p2.x + h10 * m2.x + h01 * p3.x + h11 * m3.x;
         py = h00 * p2.y + h10 * m2.y + h01 * p3.y + h11 * m3.y;
         canvas.setPixel(px, py, 0xFFFFFF);
    }
}
 
function tangent(pk1:Sprite, pk_1:Sprite){
    return new Point((pk1.x - pk_1.x) / 2, (pk1.y - pk_1.y) / 2);
}