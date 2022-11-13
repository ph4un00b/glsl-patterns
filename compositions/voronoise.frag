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

    vec4 when_eq(vec4 x, vec4 y) {
        return 1.0 - abs(sign(x - y));
    }
          float S = abs(sin(u_time));
      float S1 = (sin(u_time));
      float N = floor(mod(u_time, 10.));
      float K = 43758.5453123;
      vec2 VRAN = vec2(12.9898,78.233);

      void main(void){
      
          vec4 color=vec4(0.,0.,0.,1.);
          vec2 px=1./u_resolution;
          vec2 st=gl_FragCoord.xy*px;
      
          vec4 c2 = vec4(WHITE, 1.);
          vec4 c1 = vec4(BLACK, 1.);
          
          float T = (mod(floor(u_time / 1.734), 9.));
          T = 6.;
      
          float off = 0.;
          float num = 4.328;
          vec2 remapped = -1. + 3. * st;
      
          float test =  S;
          vec4 tmp = color;
      
          // test =  smoothstep(0.0, 2.0, st.x + ran2l(st, 3.264));
          // test =  smoothstep(0.0, 2.064, st.x + noise2c(st + u_time));
          // simulating fbm -> output [0,1]
     
          float lever = 0.512;
          test = smoothstep(0.0, lever, layers6(st));
          // test = step(lever, layers1(st));
          color += mix(c1,c2, test) * when_eq(vec4(T), vec4(6.));
          
          off = 6.032;	

//           test = smoothstep(0.0, lever, layers1(offset_in_px(st, off)));
//           color.r = (vec4(test) * when_eq(vec4(T), vec4(6.))).x;
 
//           test = smoothstep(0.0, lever, layers1(offset_in_px(st, - off)));
//           color.b = (vec4(test) * when_eq(vec4(T), vec4(6.))).x;
          
          color = T == 6. ? color : tmp;
      
          gl_FragColor = color;
      }   
