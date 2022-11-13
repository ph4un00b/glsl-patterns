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


/*
original_author:[Morgan McGuire, Kyle Whitson]
description: 3x3 and 5x5 median filter, adapted from "A Fast, Small-Radius GPU Median Filter" by Morgan McGuire in ShaderX6 https://casual-effects.com/research/McGuire2008Median/index.html
use: median(<sampler2D> texture, <vec2> st, <vec2> pixel)
options:
    - MEDIAN_AMOUNT: median3 (3x3) median5 (5x5)
    - MEDIAN_TYPE: default vec4
    - MEDIAN_SAMPLER_FNC(POS_UV): default texture2D(tex, POS_UV)
    - SAMPLER_FNC(TEX, UV): optional depending the target version of GLSL (texture2D(...) or texture(...))
license:
    Copyright (c) Morgan McGuire and Williams College, 2006. All rights reserved.
    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
    Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

#ifndef SAMPLER_FNC
#define SAMPLER_FNC(TEX, UV) texture2D(TEX, UV)
#endif

#ifndef MEDIAN_AMOUNT
#define MEDIAN_AMOUNT median5
#endif

#ifndef MEDIAN_TYPE
#define MEDIAN_TYPE vec4
#endif

#ifndef MEDIAN_SAMPLER_FNC
#define MEDIAN_SAMPLER_FNC(POS_UV) SAMPLER_FNC(tex, POS_UV)
#endif


/*
original_author: [Morgan McGuire, Kyle Whitson]
description: |
    3x3 median filter, adapted from "A Fast, Small-Radius GPU Median Filter" 
    by Morgan McGuire in ShaderX6 https://casual-effects.com/research/McGuire2008Median/index.html
use: median2D_fast3(<sampler2D> texture, <vec2> st, <vec2> pixel)
options:
    - SAMPLER_FNC(TEX, UV): optional depending the target version of GLSL (texture2D(...) or texture(...))
    - MEDIAN2D_FAST3_TYPE: default vec4
    - MEDIAN2D_FAST3_SAMPLER_FNC(POS_UV): default texture2D(tex, POS_UV)
*/

#ifndef SAMPLER_FNC
#define SAMPLER_FNC(TEX, UV) texture2D(TEX, UV)
#endif

#ifndef MEDIAN2D_FAST3_TYPE
#ifdef MEDIAN2D_TYPE
#define MEDIAN2D_FAST3_TYPE MEDIAN2D_TYPE
#else
#define MEDIAN2D_FAST3_TYPE vec4
#endif
#endif

#ifndef MEDIAN2D_FAST3_SAMPLER_FNC
#ifdef MEDIAN_SAMPLER_FNC
#define MEDIAN2D_FAST3_SAMPLER_FNC(POS_UV) MEDIAN_SAMPLER_FNC(POS_UV)
#else
#define MEDIAN2D_FAST3_SAMPLER_FNC(POS_UV) SAMPLER_FNC(tex, POS_UV)
#endif
#endif

#ifndef MEDIAN_S2
#define MEDIAN_S2(a, b) temp = a; a = min(a, b); b = max(temp, b);
#endif

#ifndef MEDIAN_2
#define MEDIAN_2(a, b) MEDIAN_S2(v[a], v[b]);
#endif

#ifndef FNC_MEDIAN2D_FAST3
#define FNC_MEDIAN2D_FAST3
#define MEDIAN_MN3(a, b, c) MEDIAN_2(a, b); MEDIAN_2(a, c);
#define MEDIAN_MX3(a, b, c) MEDIAN_2(b, c); MEDIAN_2(a, c);
#define MEDIAN_MNMX3(a, b, c) MEDIAN_MX3(a, b, c); MEDIAN_2(a, b);                                                                // 3 exchanges
#define MEDIAN_MNMX4(a, b, c, d) MEDIAN_2(a, b); MEDIAN_2(c, d); MEDIAN_2(a, c); MEDIAN_2(b, d);                                  // 4 exchanges
#define MEDIAN_MNMX5(a, b, c, d, e) MEDIAN_2(a, b); MEDIAN_2(c, d); MEDIAN_MN3(a, c, e); MEDIAN_MX3(b, d, e);                     // 6 exchanges
#define MEDIAN_MNMX6(a, b, c, d, e, f) MEDIAN_2(a, d); MEDIAN_2(b, e); MEDIAN_2(c, f); MEDIAN_MN3(a, b, c); MEDIAN_MX3(d, e, f);  // 7 exchanges
MEDIAN2D_FAST3_TYPE median2D_fast3(in sampler2D tex, in vec2 st, in vec2 radius) {
    MEDIAN2D_FAST3_TYPE v[9];
    for (int dX = -1; dX <= 1; ++dX) {
        for (int dY = -1; dY <= 1; ++dY) {
            vec2 offset = vec2(float(dX), float(dY));
            // If a pixel in the window is located at (x+dX, y+dY), put it at index (dX + R)(2R + 1) + (dY + R) of the
            // pixel array. This will fill the pixel array, with the top left pixel of the window at pixel[0] and the
            // bottom right pixel of the window at pixel[N-1].
            v[(dX + 1) * 3 + (dY + 1)] = MEDIAN2D_FAST3_SAMPLER_FNC(st + offset * radius);
        }
    }
    MEDIAN2D_FAST3_TYPE temp = MEDIAN2D_FAST3_TYPE(0.);
    MEDIAN_MNMX6(0, 1, 2, 3, 4, 5);
    MEDIAN_MNMX5(1, 2, 3, 4, 6);
    MEDIAN_MNMX4(2, 3, 4, 7);
    MEDIAN_MNMX3(3, 4, 8);
    return v[4];
}
#endif



/*
original_author: [Morgan McGuire, Kyle Whitson]
description: |
    3x3 median filter, adapted from "A Fast, Small-Radius GPU Median Filter" 
    by Morgan McGuire in ShaderX6 https://casual-effects.com/research/McGuire2008Median/index.html
use: median2D_fast5(<sampler2D> texture, <vec2> st, <vec2> pixel)
options:
    - SAMPLER_FNC(TEX, UV): optional depending the target version of GLSL (texture2D(...) or texture(...))
    - MEDIAN2D_FAST5_TYPE: default vec4
    - MEDIAN2D_FAST5_SAMPLER_FNC(POS_UV): default texture2D(tex, POS_UV)
*/

#ifndef SAMPLER_FNC
#define SAMPLER_FNC(TEX, UV) texture2D(TEX, UV)
#endif

#ifndef MEDIAN2D_FAST5_TYPE
#ifdef MEDIAN2D_TYPE
#define MEDIAN2D_FAST5_TYPE MEDIAN2D_TYPE
#else
#define MEDIAN2D_FAST5_TYPE vec4
#endif
#endif

#ifndef MEDIAN2D_FAST5_SAMPLER_FNC
#ifdef MEDIAN_SAMPLER_FNC
#define MEDIAN2D_FAST5_SAMPLER_FNC(POS_UV) MEDIAN_SAMPLER_FNC(POS_UV)
#else
#define MEDIAN2D_FAST5_SAMPLER_FNC(POS_UV) SAMPLER_FNC(tex, POS_UV)
#endif
#endif

#ifndef MEDIAN_S2
#define MEDIAN_S2(a, b) temp = a; a = min(a, b); b = max(temp, b);
#endif

#ifndef MEDIAN_2
#define MEDIAN_2(a, b) MEDIAN_S2(v[a], v[b]);
#endif

#ifndef FNC_MEDIAN2D_FAST5
#define FNC_MEDIAN2D_FAST5
#define MEDIAN_S2(a, b) temp = a; a = min(a, b); b = max(temp, b);
#define MEDIAN_2(a, b) MEDIAN_S2(v[a], v[b]);

#define MEDIAN_24(a, b, c, d, e, f, g, h) MEDIAN_2(a, b); MEDIAN_2(c, d); MEDIAN_2(e, f); MEDIAN_2(g, h);
#define MEDIAN_25(a, b, c, d, e, f, g, h, i, j) MEDIAN_24(a, b, c, d, e, f, g, h); MEDIAN_2(i, j);

MEDIAN2D_FAST5_TYPE median2D_fast5(in sampler2D tex, in vec2 st, in vec2 radius) {
    MEDIAN2D_FAST5_TYPE v[25];
    for (int dX = -2; dX <= 2; ++dX) {
        for (int dY = -2; dY <= 2; ++dY) {
            vec2 offset = vec2(float(dX), float(dY));
            // If a pixel in the window is located at (x+dX, y+dY), put it at index (dX + R)(2R + 1) + (dY + R) of the
            // pixel array. This will fill the pixel array, with the top left pixel of the window at pixel[0] and the
            // bottom right pixel of the window at pixel[N-1].
            v[(dX + 2) * 5 + (dY + 2)] = MEDIAN2D_FAST5_SAMPLER_FNC(st + offset * radius);
        }
    }

    MEDIAN2D_FAST5_TYPE temp = MEDIAN2D_FAST5_TYPE(0.);
    MEDIAN_25(0,  1,   3, 4,  2,  4,  2,  3,  6,  7);
    MEDIAN_25(5,  7,   5, 6,  9,  7,  1,  7,  1,  4);
    MEDIAN_25(12, 13, 11, 13, 11, 12, 15, 16, 14, 16);
    MEDIAN_25(14, 15, 18, 19, 17, 19, 17, 18, 21, 22);
    MEDIAN_25(20, 22, 20, 21, 23, 24, 2,  5,  3,  6);
    MEDIAN_25(0,  6,  0,  3,  4,  7,  1,  7,  1,  4);
    MEDIAN_25(11, 14, 8,  14, 8,  11, 12, 15, 9,  15);
    MEDIAN_25(9,  12, 13, 16, 10, 16, 10, 13, 20, 23);
    MEDIAN_25(17, 23, 17, 20, 21, 24, 18, 24, 18, 21);
    MEDIAN_25(19, 22, 8,  17, 9,  18, 0,  18, 0,  9);
    MEDIAN_25(10, 19, 1,  19, 1,  10, 11, 20, 2,  20);
    MEDIAN_25(2,  11, 12, 21, 3,  21, 3,  12, 13, 22);
    MEDIAN_25(4,  22, 4,  13, 14, 23, 5,  23, 5,  14);
    MEDIAN_25(15, 24, 6,  24, 6,  15, 7,  16, 7,  19);
    MEDIAN_25(3,  11, 5,  17, 11, 17, 9,  17, 4,  10);
    MEDIAN_25(6,  12, 7,  14, 4,  6,  4,  7,  12, 14);
    MEDIAN_25(10, 14, 6,  7,  10, 12, 6,  10, 6,  17);
    MEDIAN_25(12, 17, 7,  17, 7,  10, 12, 18, 7,  12);
    MEDIAN_24(10, 18, 12, 20, 10, 20, 10, 12);
    return v[12];
}
#endif



#ifndef FNC_MEDIAN
#define FNC_MEDIAN
MEDIAN_TYPE median3(in sampler2D tex, in vec2 st, in vec2 radius) {
    return median2D_fast3(tex, st, radius);
}

MEDIAN_TYPE median5(in sampler2D tex, in vec2 st, in vec2 radius) {
    return median2D_fast5(tex, st, radius);
}

MEDIAN_TYPE median(in sampler2D tex, in vec2 st, in vec2 radius) {
    return MEDIAN_AMOUNT(tex, st, radius);
}
#endif





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
description: grad4, used for snoise(vec4 v)
use: grad4(<float> j, <vec4> ip)
*/

#ifndef FNC_GRAD4
#define FNC_GRAD4
vec4 grad4(float j, vec4 ip) {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;

    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

    return p;
}
#endif



/*
original_author: [Ian McEwan, Ashima Arts]
description: Simplex Noise https://github.com/ashima/webgl-noise
use: snoise(<vec2|vec3|vec4> pos)
license: |
    Copyright (C) 2011 Ashima Arts. All rights reserved.
    Copyright (C) 2011-2016 by Stefan Gustavson (Classic noise and others)
    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
    Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    Neither the name of the GPUImage framework nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.  
*/

#ifndef FNC_SNOISE
#define FNC_SNOISE
float snoise(in vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}


float snoise(in vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

float snoise(in vec4 v) {
    const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                        -0.447213595499958); // -1 + 4 * G4

    // First corner
    vec4 i  = floor(v + dot(v, vec4(.309016994374947451)) ); // (sqrt(5) - 1)/4
    vec4 x0 = v -   i + dot(i, C.xxxx);

    // Other corners

    // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
    //  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    // i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    //  x0 = x0 - 0.0 + 0.0 * C.xxxx
    //  x1 = x0 - i1  + 1.0 * C.xxxx
    //  x2 = x0 - i2  + 2.0 * C.xxxx
    //  x3 = x0 - i3  + 3.0 * C.xxxx
    //  x4 = x0 - 1.0 + 4.0 * C.xxxx
    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;

    // Permutations
    i = mod289(i);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
                i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
            + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
            + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

    // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
    // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

    // Mix contributions from the five corners
    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
                + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}

vec2 snoise2( vec2 x ){
    float s  = snoise(vec2( x ));
    float s1 = snoise(vec2( x.y - 19.1, x.x + 47.2 ));
    return vec2( s , s1 );
}

vec3 snoise3( vec3 x ){
    float s  = snoise(vec3( x ));
    float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
    float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
    return vec3( s , s1 , s2 );
}

vec3 snoise3( vec4 x ){
    float s  = snoise(vec4( x ));
    float s1 = snoise(vec4( x.y - 19.1 , x.z + 33.4 , x.x + 47.2, x.w ));
    float s2 = snoise(vec4( x.z + 74.2 , x.x - 124.5 , x.y + 99.4, x.w ));
    return vec3( s , s1 , s2 );
}

#endif



/*
original_author: Patricio Gonzalez Vivo
description: Fractal Brownian Motion
use: fbm(<vec2> pos)
options:
    FBM_OCTAVES: numbers of octaves. Default is 4.
    FBM_NOISE_FNC(POS_UV): noise function to use Default 'snoise(POS_UV)' (simplex noise)
    FBM_VALUE_INITIAL: initial value. Default is 0.
    FBM_SCALE_SCALAR: scalar. Defualt is 2.
    FBM_AMPLITUD_INITIAL: initial amplitud value. Default is 0.5
    FBM_AMPLITUD_SCALAR: amplitud scalar. Default is 0.5
*/

#ifndef FBM_OCTAVES
#define FBM_OCTAVES 4
#endif

#ifndef FBM_NOISE_FNC
#define FBM_NOISE_FNC(POS_UV) snoise(POS_UV)
#endif

#ifndef FBM_NOISE2_FNC
#define FBM_NOISE2_FNC(POS_UV) FBM_NOISE_FNC(POS_UV)
#endif

#ifndef FBM_NOISE3_FNC
#define FBM_NOISE3_FNC(POS_UV) FBM_NOISE_FNC(POS_UV)
#endif


#ifndef FBM_NOISE_TYPE
#define FBM_NOISE_TYPE float
#endif

#ifndef FBM_VALUE_INITIAL
#define FBM_VALUE_INITIAL 0.0
#endif

#ifndef FBM_SCALE_SCALAR
#define FBM_SCALE_SCALAR 2.0
#endif

#ifndef FBM_AMPLITUD_INITIAL
#define FBM_AMPLITUD_INITIAL 0.5
#endif

#ifndef FBM_AMPLITUD_SCALAR
#define FBM_AMPLITUD_SCALAR 0.5
#endif

#ifndef FNC_FBM
#define FNC_FBM
FBM_NOISE_TYPE fbm(in vec2 st) {
    // Initial values
    FBM_NOISE_TYPE value = FBM_NOISE_TYPE(FBM_VALUE_INITIAL);
    float amplitud = FBM_AMPLITUD_INITIAL;

    // Loop of octaves
    for (int i = 0; i < FBM_OCTAVES; i++) {
        value += amplitud * FBM_NOISE2_FNC(st);
        st *= FBM_SCALE_SCALAR;
        amplitud *= FBM_AMPLITUD_SCALAR;
    }
    return value;
}

FBM_NOISE_TYPE fbm(in vec3 pos) {
    // Initial values
    FBM_NOISE_TYPE value = FBM_NOISE_TYPE(FBM_VALUE_INITIAL);
    float amplitud = FBM_AMPLITUD_INITIAL;

    // Loop of octaves
    for (int i = 0; i < FBM_OCTAVES; i++) {
        value += amplitud * FBM_NOISE3_FNC(pos);
        pos *= FBM_SCALE_SCALAR;
        amplitud *= FBM_AMPLITUD_SCALAR;
    }
    return value;
}
#endif



void main(void) {
    vec4 color=vec4(0.,0.,0.,1.);
    vec2 pixel=1./u_resolution;
    vec2 st=gl_FragCoord.xy*pixel;

    st *= 1.;

    float noise = fbm(
        st * 0.2 + u_time * 0.05
    ) /* normalizing [0,1] */ * .5 + .5;

    color.rgb += noise;

    float dx = mix(0.0, 0.5, noise);
    float dy = mix(0.0, 0.5, noise);
    // float dx = 0. + sin(u_time) * 0.1;
    // float dy = 0.;

    color.rgb += mix(
        mix(vec4(RED, 1.0) , vec4(ACQUA, 1.0), st.x + dx )
        , mix(vec4(AZUR, 1.0), vec4(VIOLET, 1.0), st.x - dy)
        , st.y + dy
    ).rgb;
    gl_FragColor = color;
}
