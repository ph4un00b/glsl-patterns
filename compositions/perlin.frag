#ifdef GL_ES
precision mediump float;
#endif
            
      uniform vec3 u_camera;
      uniform vec3 u_light;
      
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      
      varying vec4 v_position;
      varying vec3 v_normal;
      
      #if defined(MODEL_VERTEX_TEXCOORD)
      varying vec2 v_texcoord; 
      #endif
      
      #define PLATFORM_WEBGL
      /* Color palette */
      #define BLACK vec3(0.,0.,0.)
      #define WHITE vec3(1.,1.,1.)
      #define RED vec3(1.,0.,0.)
      #define GREEN vec3(0.,1.,0.)
      #define BLUE vec3(0.,0.,1.)
      #define YELLOW vec3(1.,1.,0.)
      #define CYAN vec3(0.,1.,1.)
      #define MAGENTA vec3(1.,0.,1.)
      #define ORANGE vec3(1.,.5,0.)
      #define PURPLE vec3(1.,0.,.5)
      #define LIME vec3(.5,1.,0.)
      #define ACQUA vec3(0.,1.,.5)
      #define VIOLET vec3(.5,0.,1.)
      #define AZUR vec3(0.,.5,1.)
      
      vec2 xy(in float x,in float y)
      {
          return vec2(x,y);
      }
      
      mat2 rotate2d(float _angle){
          return mat2(cos(_angle),-sin(_angle),
          sin(_angle),cos(_angle));
      }
      
      float box(in vec2 _st,in vec2 _size){
          _size=vec2(.5)-_size*.5;
          vec2 uv=smoothstep(_size,
              _size+vec2(.001),
          _st);
          uv*=smoothstep(_size,
              _size+vec2(.001),
              vec2(1.)-_st);
              return uv.x*uv.y;
          }
          
          float cross(in vec2 _st,float _size){
              // _st = rotate2d(0.012) * _st;
              _st-=vec2(.5);
              // rotate the space
              // _st = rotate2d( sin(u_time)*PI ) * _st;
              _st=rotate2d(.748)*_st;
              // move it back to the original place
              _st+=vec2(.5);
              
              return box(_st,vec2(_size,_size/4.))+
              box(_st,vec2(_size/4.,_size));
          }
          
          float circle(in vec2 _st,in float _radius){
              vec2 l=_st-vec2(.5);
              return 1.-smoothstep(_radius-(_radius*.01),
              _radius+(_radius*.01),
              dot(l,l)*4.);
          }
          
          vec4 when_eq(vec4 x, vec4 y) {
              return 1.0 - abs(sign(x - y));
          }
      
          vec4 when_neq(vec4 x, vec4 y) {
          return abs(sign(x - y));
          }
      
      float S = abs(sin(u_time));
      float S1 = (sin(u_time));
      float N = floor(mod(u_time, 10.));
      float K = 43758.5453123;
      vec2 VRAN = vec2(12.9898,78.233);
      
      uniform sampler2D u_tex0;
      
      float ran(in vec2 st, in float lever) {
          float k = 43758.5453123;
          float y;
          // vec2 vran = vec2(12.9898,78.233);
          vec2 vran = vec2(1. + N, 1. + N * 10.);
          float x = dot(st.xy, vran);
          // middle concentration
          // >>> rand(x);
          y = fract( sin(x) * k);
          // bottom concentration
          // >>> rand(x) * rand(x );
          y = fract( sin(x) * k) * fract( sin(x) * k);
          // upper concentration
          // >>> abs(sqrt(-0.384 + rand(x)));
          y = sqrt(fract( sin(x) * k));
          // hard bottom concentration with lever
          /** lever: [0 (uppper), 5 (bottom)] */
          y = pow(fract( sin(x) * k), lever);
          /** @link https://pixelero.wordpress.com/2008/04/24/various-functions-and-various-distributions-with-mathrandom/ */
          return y;
      }
      
      
      
      float stripes(in vec2 st, in float num) {
          return fract((st.x + st.y)  * num + u_time);
      }
      
      float ran2l(in vec2 st, in float lever) {
          float k = 43758.5453123;
          float y;
          vec2 vran = vec2(12.9898,78.233);
          // vec2 vran = vec2(1. + N, 1. + N * 10.);
          float x = dot(st.xy, vran);
          // hard bottom concentration with lever
          /** lever: [0 (uppper), 5 (bottom)] */
          y = pow(fract( sin(x) * k), lever);
          /** @link https://pixelero.wordpress.com/2008/04/24/various-functions-and-various-distributions-with-mathrandom/ */
          return y;
      }
      
      float ran2m(in vec2 st) {
          float k = 43758.5453123;
          float y;
          vec2 vran = vec2(12.9898,78.233);
          // vec2 vran = vec2(1. + N, 1. + N * 10.);
          float x = dot(st.xy, vran);
          // middle concentration
          // >>> rand(x);
          y = fract( sin(x) * k);
          return y;
      }
      
      float ran2b(in vec2 st) {
          float k = 43758.5453123;
          float y;
          vec2 vran = vec2(12.9898,78.233);
          // vec2 vran = vec2(1. + N, 1. + N * 10.);
          float x = dot(st.xy, vran);
          // bottom concentration
          // >>> rand(x) * rand(x );
          y = fract( sin(x) * k) * fract( sin(x) * k);
          return y;
      }
      
      float ran2u(in vec2 st) {
          float k = 43758.5453123;
          float y;
          vec2 vran = vec2(12.9898,78.233);
          // vec2 vran = vec2(1. + N, 1. + N * 10.);
          float x = dot(st.xy, vran);
          // upper concentration
          // >>> abs(sqrt(-0.384 + rand(x)));
          y = sqrt(fract( sin(x) * k));
          return y;
      }
      
      float ran1(float x) {
          float y;
          float k = 43758.5453123;
          float i = floor(x);  // integer
      float f = fract(x);  // fraction
          // return fract(sin(x)* 1.0);
          return fract(sin(x)* k);
          // middle
          // return fract( sin(x) * k);
          // botom
          // return fract( sin(x) * k) * fract( sin(x) * k);
          // upper
          // return sqrt(fract( sin(x) * k));
      }
      
      float ran1l(in float x, in float lever) {
          float y;
          float k = 43758.5453123;
          float i = floor(x);  // integer
      float f = fract(x);  // fraction
          return pow(fract( sin(x) * k), lever);
      }
      
      float noise1(float x) {
          float k = 43758.5453123;
          float i = floor(x);  // integer
      float f = fract(x);  // fraction
          // y = mix(rand(i), rand(i + 1.0), f);
          return mix(ran1(i), ran1(i + 1.), f);
      }
      
      float noise1c(float x) {
          float k = 43758.5453123;
          float i = floor(x);  // integer
      float f = fract(x);  // fraction
          float u = f * f * (3.0 - 2.0 * f ); // custom cubic curve
          return mix(ran1(i), ran1(i + 1.), u);
      }
      
      float noise2c(vec2 x) {
          vec2 i = floor(x);  // integer
      vec2 f = fract(x);  // fraction
          vec2 u = f * f * (3.0 - 2.0 * f ); // custom cubic curve
          return mix(
              mix( ran2m(i), ran2m(i + vec2(1.0, 0.0)), u.x ),
              mix( ran2m(i + vec2(0.0, 1.0)), ran2m(i + vec2(1.0, 1.0)), u.x),
              u.y
          );
      }
      
      float noise1s(float x) {
          float k = 43758.5453123;
          float i = floor(x);  // integer
      float f = fract(x);  // fraction
          // y = mix(rand(i), rand(i + 1.0), smoothstep(0.,1.,f));
          return mix(ran1(i), ran1(i + 1.0), smoothstep(0.,1.,f));
      }
      
      float noise1x(float x) {
          float y;
          float k = 43758.5453123;
          float i = floor(x);  // integer
      float f = fract(x);  // fraction
      
          // return fract( sin(i) * k);
          
          // y = mix(rand(i), rand(i + 1.0), f);
          // return mix(fract( sin(i) * k), fract( sin(i + 1.0) * k), f);
          
          // float u = f * f * (3.0 - 2.0 * f ); // custom cubic curve
          return mix(fract( sin(i) * k), fract( sin(i + 1.0) * k), f);
          
          // y = mix(rand(i), rand(i + 1.0), smoothstep(0.,1.,f));
          // return mix(fract( sin(i) * k), fract( sin(i + 1.0) * k), smoothstep(0.,1.,f));
      }
      
      
      vec2 offset_in_px(in vec2 st, in float offset) {
          vec2 pixel = 1. / u_resolution;
          // random offset
          float ran = noise2c(st + u_time);
          return st + (pixel * offset * ran);
      }
      
      
      
      /*
      original_author: [Ian McEwan, Ashima Arts]
      description: modulus of 289
      use: mod289(<float|vec2|vec3|vec4> x)
      */
      
      #ifndef FNC_MOD289
      #define FNC_MOD289
      float mod289(in float x) {
        return x - floor(x * (1. / 289.)) * 289.;
      }
      
      vec2 mod289(in vec2 x) {
        return x - floor(x * (1. / 289.)) * 289.;
      }
      
      vec3 mod289(in vec3 x) {
        return x - floor(x * (1. / 289.)) * 289.;
      }
      
      vec4 mod289(in vec4 x) {
        return x - floor(x * (1. / 289.)) * 289.;
      }
      #endif
      
      
      
      
      /*
      original_author: [Ian McEwan, Ashima Arts]
      description: permute
      use: permute(<float|vec2|vec3|vec4> x)
      license : |
        Copyright (C) 2011 Ashima Arts. All rights reserved.
        Distributed under the MIT License. See LICENSE file.
        https://github.com/ashima/webgl-noise
      */
      
      #ifndef FNC_PERMUTE
      #define FNC_PERMUTE
      float permute(in float x) {
           return mod289(((x * 34.) + 1.)*x);
      }
      
      vec3 permute(in vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
      }
      
      vec4 permute(in vec4 x) {
           return mod289(((x * 34.) + 1.)*x);
      }
      #endif
      
      
      
      /*
      original_author: [Ian McEwan, Ashima Arts]
      description: 
      use: taylorInvSqrt(<float|vec4> x)
      */
      
      #ifndef FNC_TAYLORINVSQRT
      #define FNC_TAYLORINVSQRT
      float taylorInvSqrt(in float r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      
      vec4 taylorInvSqrt(in vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      #endif
      
      
      /*
      original_author: [Ian McEwan, Ashima Arts]
      description: fade
      use: fade(<vec2|vec3|vec4> t)
      license: |
        Copyright (C) 2011 Ashima Arts. All rights reserved.
        Distributed under the MIT License. See LICENSE file.
        https://github.com/ashima/webgl-noise
      */
      
      #ifndef FNC_FADE
      #define FNC_FADE
      float fade(in float t) {
        return t * t * t * (t * (t * 6. - 15.) + 10.);
      }
      
      vec2 fade(in vec2 t) {
        return t * t * t * (t * (t * 6. - 15.) + 10.);
      }
      
      vec3 fade(in vec3 t) {
        return t * t * t * (t * (t * 6. - 15. ) + 10.);
      }
      
      vec4 fade(vec4 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
      }
      #endif
      
    
      
      #ifndef FNC_CNOISE
      #define FNC_CNOISE
      
      float cnoise(in vec2 P) {
          vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
          vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
          Pi = mod289(Pi); // To avoid truncation effects in permutation
          vec4 ix = Pi.xzxz;
          vec4 iy = Pi.yyww;
          vec4 fx = Pf.xzxz;
          vec4 fy = Pf.yyww;
      
          vec4 i = permute(permute(ix) + iy);
      
          vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
          vec4 gy = abs(gx) - 0.5 ;
          vec4 tx = floor(gx + 0.5);
          gx = gx - tx;
      
          vec2 g00 = vec2(gx.x,gy.x);
          vec2 g10 = vec2(gx.y,gy.y);
          vec2 g01 = vec2(gx.z,gy.z);
          vec2 g11 = vec2(gx.w,gy.w);
      
          vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
          g00 *= norm.x;
          g01 *= norm.y;
          g10 *= norm.z;
          g11 *= norm.w;
      
          float n00 = dot(g00, vec2(fx.x, fy.x));
          float n10 = dot(g10, vec2(fx.y, fy.y));
          float n01 = dot(g01, vec2(fx.z, fy.z));
          float n11 = dot(g11, vec2(fx.w, fy.w));
      
          vec2 fade_xy = fade(Pf.xy);
          vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
          float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
          return 2.3 * n_xy;
      }
      
      float cnoise(in vec3 P) {
          vec3 Pi0 = floor(P); // Integer part for indexing
          vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;
      
          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);
      
          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);
      
          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);
      
          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
      
          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;
      
          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);
      
          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
      }
      
      float cnoise(in vec4 P) {
          vec4 Pi0 = floor(P); // Integer part for indexing
          vec4 Pi1 = Pi0 + 1.0; // Integer part + 1
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec4 Pf0 = fract(P); // Fractional part for interpolation
          vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = vec4(Pi0.zzzz);
          vec4 iz1 = vec4(Pi1.zzzz);
          vec4 iw0 = vec4(Pi0.wwww);
          vec4 iw1 = vec4(Pi1.wwww);
      
          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);
          vec4 ixy00 = permute(ixy0 + iw0);
          vec4 ixy01 = permute(ixy0 + iw1);
          vec4 ixy10 = permute(ixy1 + iw0);
          vec4 ixy11 = permute(ixy1 + iw1);
      
          vec4 gx00 = ixy00 * (1.0 / 7.0);
          vec4 gy00 = floor(gx00) * (1.0 / 7.0);
          vec4 gz00 = floor(gy00) * (1.0 / 6.0);
          gx00 = fract(gx00) - 0.5;
          gy00 = fract(gy00) - 0.5;
          gz00 = fract(gz00) - 0.5;
          vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
          vec4 sw00 = step(gw00, vec4(0.0));
          gx00 -= sw00 * (step(0.0, gx00) - 0.5);
          gy00 -= sw00 * (step(0.0, gy00) - 0.5);
      
          vec4 gx01 = ixy01 * (1.0 / 7.0);
          vec4 gy01 = floor(gx01) * (1.0 / 7.0);
          vec4 gz01 = floor(gy01) * (1.0 / 6.0);
          gx01 = fract(gx01) - 0.5;
          gy01 = fract(gy01) - 0.5;
          gz01 = fract(gz01) - 0.5;
          vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
          vec4 sw01 = step(gw01, vec4(0.0));
          gx01 -= sw01 * (step(0.0, gx01) - 0.5);
          gy01 -= sw01 * (step(0.0, gy01) - 0.5);
      
          vec4 gx10 = ixy10 * (1.0 / 7.0);
          vec4 gy10 = floor(gx10) * (1.0 / 7.0);
          vec4 gz10 = floor(gy10) * (1.0 / 6.0);
          gx10 = fract(gx10) - 0.5;
          gy10 = fract(gy10) - 0.5;
          gz10 = fract(gz10) - 0.5;
          vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
          vec4 sw10 = step(gw10, vec4(0.0));
          gx10 -= sw10 * (step(0.0, gx10) - 0.5);
          gy10 -= sw10 * (step(0.0, gy10) - 0.5);
      
          vec4 gx11 = ixy11 * (1.0 / 7.0);
          vec4 gy11 = floor(gx11) * (1.0 / 7.0);
          vec4 gz11 = floor(gy11) * (1.0 / 6.0);
          gx11 = fract(gx11) - 0.5;
          gy11 = fract(gy11) - 0.5;
          gz11 = fract(gz11) - 0.5;
          vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
          vec4 sw11 = step(gw11, vec4(0.0));
          gx11 -= sw11 * (step(0.0, gx11) - 0.5);
          gy11 -= sw11 * (step(0.0, gy11) - 0.5);
      
          vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
          vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
          vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
          vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
          vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
          vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
          vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
          vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
          vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
          vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
          vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
          vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
          vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
          vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
          vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
          vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);
      
          vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
          g0000 *= norm00.x;
          g0100 *= norm00.y;
          g1000 *= norm00.z;
          g1100 *= norm00.w;
      
          vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
          g0001 *= norm01.x;
          g0101 *= norm01.y;
          g1001 *= norm01.z;
          g1101 *= norm01.w;
      
          vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
          g0010 *= norm10.x;
          g0110 *= norm10.y;
          g1010 *= norm10.z;
          g1110 *= norm10.w;
      
          vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
          g0011 *= norm11.x;
          g0111 *= norm11.y;
          g1011 *= norm11.z;
          g1111 *= norm11.w;
      
          float n0000 = dot(g0000, Pf0);
          float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
          float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
          float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
          float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
          float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
          float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
          float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
          float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
          float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
          float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
          float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
          float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
          float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
          float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
          float n1111 = dot(g1111, Pf1);
      
          vec4 fade_xyzw = fade(Pf0);
          vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
          vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
          vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
          vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
          float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
          return 2.2 * n_xyzw;
      }
      #endif
      
      
      float layers(vec2 st) {
        float test = 0.5 * noise2c(st * (7.0) + u_time);
        // layer2
        test += 0.25 * noise2c(st * 14.376 + vec2(u_time, 0.0));
        // layer3
        test += 0.125 * noise2c(st * 28.+ vec2(u_time, 0.0));
        // layer4
        test += 0.0625 * noise2c(st * 56.+ vec2(u_time, 0.0));
        // layer5
        test += 0.0625 * noise2c(st * 56. * 2.+ vec2(u_time, 0.0));
        return test;
    }

      float layers2(vec2 st) {
         float test = 0.5 * cnoise(st * 1. + u_time * 0.15);
          // layer2
          test += 0.25 * cnoise(st * 2. + vec2(u_time, 0.0));
          // layer3
          test += 0.125 * cnoise(st * 4.+ vec2(u_time, 0.0));
          // layer4
          test += 0.0625 * cnoise(st * 8. + vec2(u_time, 0.0));
          // layer5
          test += 0.0625 * cnoise(st * 16. + vec2(u_time, 0.0));
        return test;
    }
#include "lygia/generative/fbm.glsl"

      float layers3(vec2 st) {
         float test = .5 * fbm(st * 1. + u_time * 0.15);
          // layer2
          test += 0.25 * fbm(st * 2. + vec2(u_time, 0.0));
        //   // layer3
          test += 0.125 * fbm(st * 4.+ vec2(u_time, 0.0));
        //   // layer4
          test += 0.0625 * fbm(st * 8. + vec2(u_time, 0.0));
        //   // layer5
          test += 0.0625 * fbm(st * 16. + vec2(u_time, 0.0));
        return test;
    }

#include "lygia/generative/noised.glsl"

      float layers4(vec2 st) {
         float test = noised(st * 1. + u_time * 0.15).x;
          // layer2
          test += 0.25 * noised(st * 2. + vec2(u_time, 0.0)).x;
        // //   // layer3
          test += 0.125 * noised(st * 4.+ vec2(u_time, 0.0)).x;
        // //   // layer4
          test += 0.0625 * noised(st * 8. + vec2(u_time, 0.0)).x;
        // //   // layer5
          test += 0.0625 * noised(st * 16. + vec2(u_time, 0.0)).x;
        return test;
    }

#include "lygia/generative/snoise.glsl"

      float layers5(vec2 st) {
         float test = snoise(st * 1. + u_time * 0.15);
          // layer2
          test += 0.25 * snoise(st * 2. + vec2(u_time, 0.0));
        // // //   // layer3
          test += 0.125 * snoise(st * 4.+ vec2(u_time, 0.0));
        // // //   // layer4
          test += 0.0625 * snoise(st * 8. + vec2(u_time, 0.0));
        // // //   // layer5
          test += 0.0625 * snoise(st * 16. + vec2(u_time, 0.0));
        return test;
    }

#include "lygia/generative/voronoise.glsl"

      float layers6(vec2 st) {
         float test = 0.2 * voronoise(st * 4.5 + u_time * 0.15, 1., 1.);
          // layer2
          test += 0.25 * voronoise(st * 9. + vec2(u_time, 0.0), 1., 1.);
        // // // //   // layer3
          test += 0.125 * voronoise(st * 18. + vec2(u_time, 0.0), 1., 1.);
        // // // //   // layer4
          test += 0.0625 * voronoise(st * 36. + vec2(u_time, 0.0), 1., 1.);
        // // // //   // layer5
          test += 0.0625 * voronoise(st * 72. + vec2(u_time, 0.0), 1., 1.);
        return test;
    }

#include "lygia/generative/worley.glsl"

      float layers7(vec2 st) {
         float test = 0.1 * worley(st + u_time * 0.15);
          // layer2
          test += 0.25 * worley(st * 2. + vec2(u_time, 0.0));
        // // // // //   // layer3
          test += 0.125 * worley(st * 4. + vec2(u_time, 0.0));
        // // // // //   // layer4
          test += 0.0625 * worley(st * 8. + vec2(u_time, 0.0));
        // // // // //   // layer5
          test += 0.0625 * worley(st * 16. + vec2(u_time, 0.0));
        return test;
    }

vec3 paint(vec3 a, vec3 b) {
	return a + b;    
}

float layers1(vec2 st) {
  float test = 0.5 * noise2c(st * (1.0) + u_time);
  // layer2
  test += 0.25 * noise2c(st * 2. + vec2(u_time, 0.0));
  // layer3
  test += 0.125 * noise2c(st * 4.+ vec2(u_time, 0.0));
  // layer4
  test += 0.0625 * noise2c(st * 8.+ vec2(u_time, 0.0));
  // layer5
  test += 0.0625 * noise2c(st * 16.+ vec2(u_time, 0.0));
  return test;
}
void main(void){
 	vec3 c1 = BLACK;
  vec3 c2 = WHITE;
  vec2 pixel=1./u_resolution;
  vec2 st=gl_FragCoord.xy*pixel;
  // st.x *= u_resolution.x/u_resolution.y;
	
    st = st * 3.;

    vec2 i = ceil(st);  // integer
	vec2 f = fract(st);  // fraction
    vec3 color = vec3(0.);
    vec3 cell = vec3(0.);

    color.r = fract(st.x);
    color.g = fract(st.y);
    color.b = abs(sin(u_time));
    
    cell = paint(AZUR, VIOLET);
    float lever = 0.512;
    float test = smoothstep(0.0, lever, layers(st));
  	cell = mix(c1,c2, test);
    color = i.x == 1. && i.y == 1. ? cell : color;
    cell = paint(AZUR, ACQUA);

        // lever = 0.512;
    test = smoothstep(0.0, lever, layers4(st));
    cell = mix(c1,c2, test);

    color = i.x == 2. && i.y == 1. ? cell : color;

    cell = paint(AZUR, PURPLE);

        // lever = 0.512;
    test = smoothstep(0.0, lever, layers7(st));
    cell = mix(c1,c2, test);
    color = i.x == 3. && i.y == 1. ? cell : color;

    cell = paint(LIME, ORANGE);

        // lever = 0.512;
    test = smoothstep(0.0, lever, layers6(st));
    cell = mix(c1,c2, test);
    color = i.x == 1. && i.y == 2. ? cell : color;

    cell = paint(AZUR, BLUE);
        // lever = 0.512;
    test = smoothstep(0.0, lever, layers5(st));
    cell = mix(c1,c2, test);

    color = i.x == 2. && i.y == 2. ? cell : color;

    cell = paint(LIME, ACQUA);

        // lever = 0.512;
    test = smoothstep(0.0, lever, layers3(st));
    cell = mix(c1,c2, test);
    color = i.x == 3. && i.y == 2. ? cell : color;

    cell = paint(LIME, RED);
    // lever = 0.512;
    test = smoothstep(0.0, lever, layers2(st));
    cell = mix(c1,c2, test);
    color = i.x == 1. && i.y == 3. ? cell : color;

    cell = paint(LIME, CYAN);

        // lever = 0.512;
    test = smoothstep(0.0, lever, layers1(st));
    cell = mix(c1,c2, test);
    color = i.x == 2. && i.y == 3. ? cell : color;
    cell = paint(RED, ACQUA );
    color = i.x == 3. && i.y == 3. ? cell : color;

    gl_FragColor = vec4(color,1.0);
      }   