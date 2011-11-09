(function(a,h){var e="",c,i=window.document.createElement("div"),l=/^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i;a.each({Webkit:"webkit",Moz:"",O:"o",ms:"MS"},function(a,g){if(i.style[a+"TransitionProperty"]!==h)return e="-"+a.toLowerCase()+"-",c=g,false});a.fx={off:false,cssPrefix:e,transitionEnd:c?c+"TransitionEnd":"transitionend",animationEnd:c?c+"AnimationEnd":"animationend"};a.fn.anim=function(c,g,i,k){var b,d={},f,n=this,j,o=a.fx.transitionEnd;g===h&&(g=0.5);
a.fx.off&&(g=0);if(typeof c=="string")d[e+"animation-name"]=c,d[e+"animation-duration"]=g+"s",o=a.fx.animationEnd;else{for(f in c)l.test(f)?(b||(b=[]),b.push(f+"("+c[f]+")")):d[f]=c[f];b&&(d[e+"transform"]=b.join(" "));a.fx.off||(d[e+"transition"]="all "+g+"s "+(i||""))}j=function(){var b={};b[e+"transition"]=b[e+"animation-name"]="none";a(this).css(b);k&&k.call(this)};if(g>0)this.one(o,j);setTimeout(function(){n.css(d);g<=0&&setTimeout(function(){n.each(function(){j.call(this)})},0)},0);return this};
i=null})(Zepto);
(function(a,h){function e(b,d,f,c,j){typeof d=="function"&&!j&&(j=d,d=h);f={opacity:f};if(c)a.fx.transforms3d?f.scale3d=c+",1":f.scale=c,b.css(a.fx.cssPrefix+"transform-origin","0 0");return b.anim(f,(typeof d=="number"?d:k[d]||k._default)/1E3,null,j)}function c(b,d,f,c){return e(b,d,0,f,function(){g.call(a(this));c&&c.call(this)})}var i=window.document,l=i.documentElement,m=a.fn.show,g=a.fn.hide,p=a.fn.toggle,k={_default:400,fast:200,slow:600};a.fn.show=function(b,d){m.call(this);b===h?b=0:this.css("opacity",
0);return e(this,b,1,"1,1",d)};a.fn.hide=function(b,d){return b===h?g.call(this):c(this,b,"0,0",d)};a.fn.toggle=function(b,d){return b===h||typeof b=="boolean"?p.call(this,b):this[this.css("display")=="none"?"show":"hide"](b,d)};a.fn.fadeTo=function(b,d,a){return e(this,b,d,null,a)};a.fn.fadeIn=function(b,d){var a=this.css("opacity");a>0?this.css("opacity",0):a=1;return m.call(this).fadeTo(b,a,d)};a.fn.fadeOut=function(b,a){return c(this,b,null,a)};a.fn.fadeToggle=function(a,d){return this[this.css("opacity")==
0||this.css("display")=="none"?"fadeIn":"fadeOut"](a,d)};a.extend(a.fx,{speeds:k,transforms3d:function(b){var d=false;a.each(b,function(a,b){if(l.style[b]!==h){var c;if(!(c=a!=1)){var e;c=i.createElement("div");e=i.createElement("div");c.innerHTML+="&shy;<style>@media (-webkit-transform-3d){#zeptotest{left:9px;position:absolute}}</style>";e.id="zeptotest";c.appendChild(e);l.appendChild(c);e=e.offsetLeft===9;c.parentNode.removeChild(c);c=e}d=c;return false}});return d}("perspectiveProperty WebkitPerspective MozPerspective OPerspective msPerspective".split(" "))})})(Zepto);