// Author: phau
// Title: basics plus!
// lesson: rgb n random!

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

vec2 offset_in_px(in vec2 st, in float offset) {
    vec2 pixel = 1. / u_resolution;
    // random offset
    float ran = ran(st, -0.416);
    return st + (pixel * offset * ran);
}

float stripes(in vec2 st, in float num) {
    return fract((st.x + st.y)  * num + u_time);
}



void main(void){
    vec4 color=vec4(0.,0.,0.,1.);
    vec2 px=1./u_resolution;
    vec2 st=gl_FragCoord.xy*px;
  
    vec4 c2 = vec4(WHITE, 1.);
    vec4 c1 = vec4(BLACK, 1.);
    
    float T = (mod(floor(u_time / 2.15), 9.));
    // T = 2.;

    float off = 0.;
    float num = 4.328;
    vec2 remapped = -1. + 3. * st;
    // mixing
    float test =  S;


    color += mix(c1,c2, test) * when_eq(vec4(T), vec4(1.));
    
    // gradient

    vec4 tmp = color;
    tmp = color;
    
    test =  st.x + S;
    color += test * when_eq(vec4(T), vec4(2.));
    
    off = 5.936 * 2.;
    
    test =  offset_in_px(st + S, off).x;
    color.r = (vec4(test) * when_eq(vec4(T), vec4(2.))).x;
    
    test =  offset_in_px(st + S, - off).x;
    color.b = (vec4(test) * when_eq(vec4(T), vec4(2.))).x;
    
    color = T == 2. ? color : tmp;
    // repeating -> when coord/uv are multiplied
    remapped = -1. + 3. * st;
    tmp = color;
    test =  fract(remapped.x + u_time);
    color += vec4(test) * when_eq(vec4(T), vec4(3.));
    // color += step(0.5, test) * when_eq(vec4(T), vec4(3.));
    off = 4.904;
    
    test =  fract(offset_in_px(remapped+ u_time, off).x);
    color.r = (vec4(test) * when_eq(vec4(T), vec4(3.))).x;
    
    test =  fract(offset_in_px(remapped+ u_time, - off *  2.000).x);
    color.b = (vec4(test) * when_eq(vec4(T), vec4(3.))).x;
    
    color = T == 3. ? color : tmp;

    // step -> 0 or 1
    tmp = color;
    
    test =  step(S, st.x);
    color += vec4(test) * when_eq(vec4(T), vec4(4.));
    
    off = 2.936;
    
    test =  step(S, offset_in_px(st, off).x);
    color.r = (vec4(test) * when_eq(vec4(T), vec4(4.))).x;
    
    test =  step(S, offset_in_px(st, -off).x);
    color.b = (vec4(test) * when_eq(vec4(T), vec4(4.))).x;
    
    color = T == 4. ? color : tmp;
    
    // circle
    tmp = color;
    remapped = -1. + 2. * st;
    test =  step(S, length(remapped));
    color = vec4(test) * when_eq(vec4(T), vec4(5.));
    
    off = 4.912;
    
    test =  step(S, length(offset_in_px(remapped, off)));
    color.r = (vec4(test) * when_eq(vec4(T), vec4(5.))).x;
    
    test =  step(S, length(offset_in_px(remapped, - off *2.)));
    color.b = (vec4(test) * when_eq(vec4(T), vec4(5.))).x;
    
    color = T == 5. ? color : tmp;
    // smoothstep -> easing
    tmp = color;
    test =  smoothstep(0.0, S, st.x);
    color += mix(c1,c2, test) * when_eq(vec4(T), vec4(6.));
    
    off = 6.032;
    
    test = smoothstep(0.0, S, offset_in_px(st, off).x);
    color.r = (vec4(test) * when_eq(vec4(T), vec4(6.))).x;
    
    test = smoothstep(0.0, S, offset_in_px(st, - off).x);
    color.b = (vec4(test) * when_eq(vec4(T), vec4(6.))).x;
    
    color = T == 6. ? color : tmp;
    // fadein - fadeout
    tmp = color;
    test = smoothstep(0.0, S, st.x) 
        - smoothstep(S, 1., st.x);
    color += vec4(test) * when_eq(vec4(T), vec4(7.));

    off = 5.200;
    
    test = smoothstep(0.0, S, offset_in_px(st, off).x) 
        - smoothstep(S, 1., offset_in_px(st, off).x);
    color.r = (vec4(test) * when_eq(vec4(T), vec4(7.))).x;
    
    test = smoothstep(0.0, S, offset_in_px(st, - off * 2.).x) 
        - smoothstep(S, 1., offset_in_px(st, - off * 2.).x);
    color.b = (vec4(test) * when_eq(vec4(T), vec4(7.))).x;
    
    color = T == 7. ? color : tmp;
    // stripes
    tmp = color;
    num = 4.328;
 	test = step(0.500, stripes(st, num));
 	color += vec4(test) * when_eq(vec4(T), vec4(8.));
    // from Vivo's tips with some random
    off = 3.200;
    
    test = step(0.5, stripes(offset_in_px(st, off), num));
    color.r = (vec4(test) * when_eq(vec4(T), vec4(8.))).x;
    
    test = step(0.5, stripes(offset_in_px(st, - off), num));
    color.b = (vec4(test) * when_eq(vec4(T), vec4(8.))).x;
    
    color = T == 8. ? color : tmp;
  	gl_FragColor = color;
}