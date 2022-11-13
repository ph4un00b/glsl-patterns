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

#include "lygia/filter/median.glsl"
#include "lygia/generative/fbm.glsl"

void main(void) {
    vec4 color=vec4(0.,0.,0.,1.);
    vec2 pixel=1./u_resolution;
    vec2 st=gl_FragCoord.xy*pixel;

    st *= 1.;

    vec4 noise = fbm(st * .2 + u_time * 0.05) /* normalizing [0,1] */ * .5 + .5;
    color.rgb += noise.rgb;

    float dx = mix(-0.5, 0.5, noise.r);
    float dy = mix(-0.5, 0.5, noise.r);
    // float dx = 0. + sin(u_time) * 0.1;
    // float dy = 0.;

    color.rgb += mix(
        mix(vec4(RED, 1.0) , vec4(ACQUA, 1.0), st.x + dx )
        , mix(vec4(AZUR, 1.0), vec4(VIOLET, 1.0), st.x - dy)
        , st.y + dy
    ).rgb;
    gl_FragColor = color;
}