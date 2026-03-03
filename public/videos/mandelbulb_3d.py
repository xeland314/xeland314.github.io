import pyray as rl
import numpy as np
import os
import math

# CONFIGURACION
WIDTH, HEIGHT = 800, 800
OUTPUT_DIR = "render_mandelbulb_3d"
MAX_FRAMES = 900  # 30 segundos
FPS = 30

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# SHADER DE RAYMARCHING CON gl_FragCoord (Mas robusto)
VS_CODE = b"""
#version 330
in vec3 vertexPosition;
uniform mat4 mvp;
void main() {
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
"""

FS_CODE = b"""
#version 330
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCamPos;
uniform vec3 uCamTarget;

out vec4 finalColor;

float map(vec3 p) {
    vec3 z = p;
    float dr = 1.0;
    float r = 0.0;
    float power = 8.0 + sin(uTime * 0.4) * 2.0; 

    for (int i = 0; i < 15; i++) {
        r = length(z);
        if (r > 2.0) break;
        
        float theta = acos(clamp(z.z / r, -1.0, 1.0));
        float phi = atan(z.y, z.x);
        dr = pow(r, power - 1.0) * power * dr + 1.0;
        
        float zr = pow(r, power);
        theta = theta * power;
        phi = phi * power;
        
        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += p;
    }
    return 0.5 * log(r) * r / dr;
}

vec3 getNormal(vec3 p) {
    float h = 0.001;
    vec2 e = vec2(h, 0.0);
    return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
    ));
}

void main() {
    // Calcular UVs centrados usando la resolucion real
    vec2 uv = (gl_FragCoord.xy / uRes.xy) - 0.5;
    uv.x *= (uRes.x / uRes.y);
    
    vec3 ro = uCamPos;
    vec3 target = uCamTarget;
    
    // Matriz de vista de camara
    vec3 cw = normalize(target - ro);
    vec3 cp = vec3(0.0, 1.0, 0.0);
    vec3 cu = normalize(cross(cw, cp));
    vec3 cv = normalize(cross(cu, cw));
    
    // Direccion del rayo (con FOV de 1.5)
    vec3 rd = normalize(uv.x * cu + uv.y * cv + 1.5 * cw);
    
    float tmax = 15.0;
    float t = 0.0;
    float d = 0.0;
    bool hit = false;
    
    for (int i = 0; i < 150; i++) {
        d = map(ro + rd * t);
        if (d < 0.0001) { hit = true; break; }
        t += d;
        if (t > tmax) break;
    }
    
    vec3 color = vec3(0.02, 0.02, 0.05); // Fondo oscuro
    
    if (hit) {
        vec3 p = ro + rd * t;
        vec3 n = getNormal(p);
        vec3 ld = normalize(vec3(1.0, 1.0, 1.0)); // Luz
        
        float diff = max(dot(n, ld), 0.0);
        float amb = 0.15;
        
        // Color psicodelico basado en normales
        vec3 baseCol = 0.5 + 0.5 * cos(uTime * 0.2 + n + vec3(0, 2, 4));
        color = baseCol * (diff + amb);
        
        // Niebla para dar profundidad
        color = mix(color, vec3(0.02, 0.02, 0.05), 1.0 - exp(-0.15 * t));
    }
    
    finalColor = vec4(color, 1.0);
}
"""


def save_ppm(filename, width, height, data):
    with open(filename, "wb") as f:
        f.write(f"P6\n{width} {height}\n255\n".encode())
        pixels = np.frombuffer(data, dtype=np.uint8).reshape(
            (height, width, 4)
        )
        # Raylib load_image_from_screen devuelve la imagen invertida en Y
        # La flipeamos para que el video salga bien
        pixels = np.flipud(pixels)
        f.write(pixels[:, :, :3].tobytes())


def main():
    rl.set_config_flags(rl.FLAG_WINDOW_HIDDEN)
    rl.init_window(WIDTH, HEIGHT, b"Mandelbulb 3D Ultra Fix")

    shader = rl.load_shader_from_memory(VS_CODE, FS_CODE)
    u_res = rl.get_shader_location(shader, b"uRes")
    u_time = rl.get_shader_location(shader, b"uTime")
    u_campos = rl.get_shader_location(shader, b"uCamPos")
    u_camtarget = rl.get_shader_location(shader, b"uCamTarget")

    res_val = rl.ffi.new("float[2]", [float(WIDTH), float(HEIGHT)])
    rl.set_shader_value(
        shader, u_res, res_val, rl.SHADER_UNIFORM_VEC2
    )

    print(f"Renderizando Mandelbulb 3D (Correccion UV y Camara)...")

    for i in range(MAX_FRAMES):
        time = i / FPS
        # Orbita estable a radio 4.5
        cam_x = 4.5 * math.sin(time * 0.2)
        cam_z = 4.5 * math.cos(time * 0.2)
        cam_y = 1.5 * math.cos(time * 0.1)

        u_time_val = rl.ffi.new("float*", time)
        u_campos_val = rl.ffi.new("float[3]", [cam_x, cam_y, cam_z])
        u_camtarget_val = rl.ffi.new("float[3]", [0.0, 0.0, 0.0])

        rl.set_shader_value(
            shader, u_time, u_time_val, rl.SHADER_UNIFORM_FLOAT
        )
        rl.set_shader_value(
            shader, u_campos, u_campos_val, rl.SHADER_UNIFORM_VEC3
        )
        rl.set_shader_value(
            shader,
            u_camtarget,
            u_camtarget_val,
            rl.SHADER_UNIFORM_VEC3,
        )

        rl.begin_drawing()
        rl.clear_background(rl.BLACK)
        rl.begin_shader_mode(shader)
        rl.draw_rectangle(0, 0, WIDTH, HEIGHT, rl.WHITE)
        rl.end_shader_mode()
        rl.end_drawing()

        img = rl.load_image_from_screen()
        save_ppm(
            os.path.join(OUTPUT_DIR, f"frame_{i:04d}.ppm"),
            WIDTH,
            HEIGHT,
            rl.ffi.buffer(img.data, WIDTH * HEIGHT * 4)[:],
        )
        rl.unload_image(img)

        if i % 30 == 0:
            print(f"Progreso: {i}/{MAX_FRAMES}")

    rl.unload_shader(shader)
    rl.close_window()
    print("Renderizado finalizado con exito.")


if __name__ == "__main__":
    main()
