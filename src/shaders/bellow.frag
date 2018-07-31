#define UV( p ) texture( iChannel0, p )

#define TAU 6.28318530717958647692

const float ts = 0.016; // timestep 60/fps

vec2 gradient ()
{
	return vec2(0);
}

vec2 divergence ( vec2 n, vec2 r )
{
	vec3 p = vec3( 1./r.x, 1./r.y, 0. );
    
    vec2 n1 = n + p.xz;
    vec2 n2 = n + p.zy;
    vec2 n3 = n - p.xz;
    vec2 n4 = n - p.zy;
    
    return 0.5 * ( ( UV( n1 ).ab - UV( n3 ).ab ) + ( UV( n2 ).ab - UV( n4 ).ab ) );
}

float jacobi( vec2 n, vec2 r, float alpha, float u )
{
    vec3 p = vec3( 1./r.x, 1./r.y, 0. );
    
    vec2 n1 = n + p.xz;
    vec2 n2 = n + p.zy;
    vec2 n3 = n - p.xz;
    vec2 n4 = n - p.zy;
    
    // account for neighboring values
    float diff = UV( n1 ).r + UV( n2 ).r + UV( n3 ).r + UV( n4 ).r;
    
    return diff + alpha * u;
}

void diffuse( inout vec4 state, vec2 n, vec2 r )
{
    float u = state.r;
    float alpha = (u * u) / ts;
    float rBeta = 1. / (4. + alpha);
    
    float diff = jacobi( n, r, alpha, u ) * rBeta;
    
   	float cof = state.g; // spread
    
    float factor = cof * diff;
    
    float minimum = 0.01;
    
	if ( factor >= -minimum && factor < 0.0 ) factor = -minimum;
    
    state.r = u + factor;
}

void advect( inout vec4 state, vec2 n, vec2 r )
{   
    vec2 coord = n - ts * 1./r * n;
    
    vec3 p = vec3( 1./r.x, 1./r.y, 0. );
    
    vec2 n1 = coord + p.xz;
    vec2 n2 = coord + p.zy;
    vec2 n3 = coord - p.xz;
    vec2 n4 = coord - p.zy;
    
    float m21 = mix( UV( n1 ).g, UV( n2 ).g, ts );
    float m22 = mix( UV( n3 ).g, UV( n4 ).g, ts );
    float mixer = mix( m21, m22, -0.125 );
    
    state.g = mixer;
    //state.g = smoothstep(0.0, mixer, 0.125 );
}

void projection( inout vec4 state, vec2 n, vec2 r )
{
	state.ab = divergence( n, r );
    
    //state.g = mix(state.gg, state.ab, 0.5).x;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 r = iResolution.xy * iResolution.z;
    vec2 n = fragCoord / r;
    vec2 m = iMouse.xy / r;
    
    // use self (bufferA) as state.
    // r = density
    // g = pressure
    // b = velocityX
    // a = velocityY
    vec4 state = UV( n );
    
    if ( iFrame == 0 )
    {
        // set initial pressure
        state.g = fract(sin(n.x * 132476. + n.y * 9087.) * 27846.) * 0.001;
        
        // set velocity
        state.a = sin(1. * state.g);
    	state.b = cos(1. * state.g);
        
        return;
    }
    
    //float u = 0.5 + (.1 * sin(TAU * mod(iTime, 60.)));

    // source domain (x /2, y / 100)
    //if ( distance( n, vec2( u, 0.0001 ) ) < 0.05 )
    //{
        // steaming from the bottom with a predictable jitter

        //float v = pow( sin( iTime ), 0.06125 );

        //state.r = mix( v, length( n ), 0.125 );
    //}
    
    if (length(m) > 0. && distance( m, n ) < 0.05)
    {
        state.r = mix( state, vec4( vec2( 1. ), m * state.r ), pow( 1. - smoothstep( 0.0001,0.05, length( n-m ) ), 0.25 ) ).x;
    }
    
    advect( state, n, r );
    
    diffuse( state, n, r );
    
    //projection( state, n, r );
    
    fragColor = state;
}