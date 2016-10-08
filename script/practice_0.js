/**
 * @fileoverview practice0
 * @author sungood
 */

'use strict'

window.onload = () => {

    /**
     * Get canvas 
     * @type {canvas}
     */
    let l_canvas = document.getElementById( 'canvas' );


    /**
     * Set canvas size
     */
    l_canvas.width  = 500;
    l_canvas.height = 500;


    /**
     * Get webgl context 
     * @type {context}
     */
    let l_webgl_context = l_canvas.getContext( 'webgl' ) || l_canvas.getContext( 'experimental-webgl' );


    // Set initial color
    l_webgl_context.clearColor( 0.0, 0.0, 0.0, 1.0 );

    // Set initial depth
    l_webgl_context.clearDepth( 1.0 );

    // Init canvas
    l_webgl_context.clear( l_webgl_context.COLOR_BUFFER_BIT | l_webgl_context.DEPTH_BUFFER_BIT );

    
    let l_vertex_shader_element   = document.getElementById( 'vs' );
    let l_fragment_shader_element = document.getElementById( 'fs' );

    Promise
        .all( [ getURL( l_vertex_shader_element.src ), getURL( l_fragment_shader_element.src ) ] )
        .then( ( a_value ) => {

            // Create shader
            let l_vertex_shader   = create_shader( l_webgl_context, a_value[0], l_vertex_shader_element.type   );
            let l_fragment_shader = create_shader( l_webgl_context, a_value[1], l_fragment_shader_element.type );

            // Create program object
            let l_program_object  = create_program( l_webgl_context, l_vertex_shader, l_fragment_shader );

            // Get attributeLocation
            let l_a_attribute_location = new Array(2);
            l_a_attribute_location[0] = l_webgl_context.getAttribLocation( l_program_object, 'g_a_v3_position' );
            l_a_attribute_location[1] = l_webgl_context.getAttribLocation( l_program_object, 'g_a_v4_color' );

            // attribute num( in this case, xyz : 3 )   
            let l_ai_attribute_stride = new Array(2);
            l_ai_attribute_stride[0] = 3;
            l_ai_attribute_stride[1] = 4;


            // Model(Vertex) data
            let l_a_f_vertex_position = [
                 0.0, 1.0, 0.0,
                 1.0, 0.0, 0.0,
                -1.0, 0.0, 0.0
            ];

            // Model(Vertex) data
            let l_a_f_vertex_color = [
                0.0, 1.0, 0.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0
            ];


            // Create vbo
            let l_vbo_position = create_vbo( l_webgl_context, l_a_f_vertex_position );
            let l_vbo_color    = create_vbo( l_webgl_context, l_a_f_vertex_color );

            // Bind vbo, set attribute enabled and regist attribute( position )
            l_webgl_context.bindBuffer( l_webgl_context.ARRAY_BUFFER, l_vbo_position );
            l_webgl_context.enableVertexAttribArray( l_a_attribute_location[0] );
            l_webgl_context.vertexAttribPointer( l_a_attribute_location[0], l_ai_attribute_stride[0], l_webgl_context.FLOAT, false, 0, 0 );


            // Bind vbo, set attribute enabled and regist attribute( color )
            l_webgl_context.bindBuffer( l_webgl_context.ARRAY_BUFFER, l_vbo_color );
            l_webgl_context.enableVertexAttribArray( l_a_attribute_location[1] );
            l_webgl_context.vertexAttribPointer( l_a_attribute_location[1], l_ai_attribute_stride[1], l_webgl_context.FLOAT, false, 0, 0 );


            // Create matIV object
            let l_matrix_object = new matIV();

            // Create and init model, view, projection matrix
            let l_ma_model_matrix      = l_matrix_object.identity( l_matrix_object.create() );
            let l_ma_view_matrix       = l_matrix_object.identity( l_matrix_object.create() );
            let l_ma_projection_matrix = l_matrix_object.identity( l_matrix_object.create() );
            let l_ma_mvp_matrix        = l_matrix_object.identity( l_matrix_object.create() );

            // Vew transformation matrix
            l_matrix_object.lookAt( [ 0.0, 1.0, 3.0 ], [ 0, 0, 0 ], [ 0, 1, 0 ], l_ma_view_matrix );

            // Projection transformation matrix
            l_matrix_object.perspective( 90, l_canvas.width/l_canvas.height, 0.1, 100, l_ma_projection_matrix );

            // Create MVP matrix
            l_matrix_object.multiply( l_ma_projection_matrix, l_ma_view_matrix, l_ma_mvp_matrix );
            l_matrix_object.multiply( l_ma_mvp_matrix, l_ma_model_matrix, l_ma_mvp_matrix );

            // Get uniform location
            let l_uniform_location = l_webgl_context.getUniformLocation( l_program_object, 'g_u_m4_mvp' );

            // Register mvp matrix to uniformLocation
            l_webgl_context.uniformMatrix4fv( l_uniform_location, false, l_ma_mvp_matrix );


            // Clear
            l_webgl_context.clear( l_webgl_context.COLOR_BUFFER_BIT | l_webgl_context.DEPTH_BUFFER_BIT );

            // Draw model
            l_webgl_context.drawArrays( l_webgl_context.TRIANGLES, 0, 3 );

            // Redraw contex
            l_webgl_context.flush();
        });

}


/**
 * Get url data 
 * @param  {url}     a_st_url  url
 * @return {string}            source
 */
function getURL( a_st_url )
{
    return new Promise( ( resolve, reject ) => {

        // Create request
        let l_req = new XMLHttpRequest();

        l_req.open( 'GET', a_st_url, true );

        l_req.onload = () => {
            if( l_req.status === 200 )
            {
                resolve( l_req.responseText );
            }
        };

        l_req.send();
    });
}



/**
 * Create shader 
 * @param  {context} a_webgl_context webgl context
 * @param  {number}  a_st_source     source
 * @param  {number}  a_st_type       type
 * @return {shader}                  shader
 */
function create_shader( a_webgl_context, a_st_source, a_st_type )
{
    let l_shader;

    if( a_st_type === 'x-shader/x-vertex' )
    {
        l_shader = a_webgl_context.createShader( a_webgl_context.VERTEX_SHADER );
    }
    else if( a_st_type === 'x-shader/x-fragment' )
    {
        l_shader = a_webgl_context.createShader( a_webgl_context.FRAGMENT_SHADER );
    }

    // Assign created shader to source
    a_webgl_context.shaderSource( l_shader, a_st_source );

    // Compile shader
    a_webgl_context.compileShader( l_shader );

    // Error Check
    if( a_webgl_context.getShaderParameter( l_shader, a_webgl_context.COMPILE_STATUS ))
    {
        return l_shader;
    }
}


/**
 * Create program object 
 * @param  {context}  a_webgl_context   webgl context
 * @param  {shader}   a_vs              vertex shader
 * @param  {shader}   a_fs              fragment shader
 * @return {program}                    program object
 */
function create_program( a_webgl_context, a_vs, a_fs )
{
    let l_program = a_webgl_context.createProgram();

    // Assign shader to program object
    a_webgl_context.attachShader( l_program, a_vs );
    a_webgl_context.attachShader( l_program, a_fs );

    // Link
    a_webgl_context.linkProgram( l_program );

    // Error Check
    if( a_webgl_context.getProgramParameter( l_program, a_webgl_context.LINK_STATUS ))
    {
        // Set use program
        a_webgl_context.useProgram( l_program );

        return l_program;
    }
}


/**
 * Create VBO( vertex buffer object )
 * @param  {context}  a_webgl_context   webgl context
 * @param  {shader}   a_data            data
 * @return {vbo}                        vertex buffer object
 */
function create_vbo( a_webgl_context, a_data )
{
    let l_vbo = a_webgl_context.createBuffer();

    // Bind buffer
    a_webgl_context.bindBuffer( a_webgl_context.ARRAY_BUFFER, l_vbo );

    // Set data to buffer
    a_webgl_context.bufferData( a_webgl_context.ARRAY_BUFFER, new Float32Array( a_data ), a_webgl_context.STATIC_DRAW );

    // Unbind buffer
    a_webgl_context.bindBuffer( a_webgl_context.ARRAY_BUFFER, null );

    return l_vbo;
}
