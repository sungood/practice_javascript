attribute vec3 g_a_v3_position;
attribute vec4 g_a_v4_color;
uniform   mat4 g_u_m4_mvp;
varying   vec4 g_v_v4_color;

void main( void )
{
    g_v_v4_color = g_a_v4_color;
    gl_Position  = g_u_m4_mvp * vec4( g_a_v3_position, 1.0 );
}
