#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_tex0;
uniform vec2        u_tex0Resolution;

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

#include "lygia/filter/median.glsl"
#include "lygia/generative/fbm.glsl"

void main(void) {
    vec4 color=vec4(0.,0.,0.,1.);
    vec2 pixel=1./u_resolution;
    vec2 st=gl_FragCoord.xy*pixel;

#if defined(BACKGROUND)
    // color.rgb= PURPLE + AZUR;
    vec2 pos=st;

    pos *= 2.;
    vec2 ipos = floor(pos);
    vec2 fpos = fract(pos);
    //
    // 1,0 | 1,1
    // 0,0 | 0,1
    //
    // 1+1 | 2+1
    // 0+0 | 1+0
    //
    // 2 | 3
    // 0 | 1
    float test = ipos.x + ipos.y + ipos.x;
    vec3 isOne = when_eq(vec4(test), vec4(0.0)).xyz;
    vec3 isTwo = when_eq(vec4(test), vec4(1.0)).xyz;
    vec3 isThree = when_eq(vec4(test), vec4(2.0)).xyz;
    vec3 isFour = when_eq(vec4(test), vec4(3.0)).xyz;

    // vec4 ONE = isOne.x ? vec4(RED, 1.0) : vec4(BLACK, 1.0);
    // vec4 TWO = isTwo ? vec4(ACQUA, 1.0) : vec4(0.0);
    // vec4 THREE = isThree ? vec4(AZUR, 1.0) : vec4(0.0);
    // vec4 FOUR = isFour ? vec4(VIOLET, 1.0) : vec4(0.0);

	// color.rgb = ONE + TWO + THREE + FOUR;

    // >>>>>>>> refactor with mix

    st *= 1.;
    vec4 danny = texture2D(u_tex0, fract(st * 1.));

    color.rgb += danny.rgb;
    // median removes high frequency details;
    // color.rgb += median(u_tex0, st, pixel * 2.);
    vec4 noise = fbm(st * .2 + u_time * 0.05) /* normalizing [0,1] */ * .5 + .5;
    // color.rgb += noise.rgb;

    float dx = mix(-0.5, 0.5, noise.r);
    float dy = mix(-0.5, 0.5, noise.r);

    color.rgb += mix(
        mix(vec4(RED, 1.0) , vec4(ACQUA, 1.0), st.x + dx )
        , mix(vec4(AZUR, 1.0), vec4(VIOLET, 1.0), st.x - dy)
        , st.y + dy
    ).rgb;
    

#else
        // color.rgb=AZUR;
    color.rgb = mix(
        mix(vec4(RED, 1.0) , vec4(ACQUA, 1.0), st.x)
        , mix(vec4(AZUR, 1.0), vec4(VIOLET, 1.0), st.x)
        , 1.8 + st.y
    ).rgb;

        // Diffuse shading from directional light
        vec3 n=normalize(v_normal);
        vec3 l=normalize(u_light-v_position.xyz);
        color.rgb+=dot(n,l)*.5+.5;
#endif

    gl_FragColor = color;
}