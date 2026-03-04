import os
import math

# Directorio de salida
OUTPUT_DIR = "public/ppm"

def ensure_dir():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

def clamp(val):
    """Asegura que el valor esté entre 0 y 255"""
    return max(0, min(255, int(val)))

def save_p3(filename, width, height, pixels):
    """Guarda una imagen en formato PPM P3 (ASCII)"""
    with open(os.path.join(OUTPUT_DIR, filename), "w") as f:
        f.write(f"P3\n{width} {height}\n255\n")
        for r, g, b in pixels:
            f.write(f"{clamp(r)} {clamp(g)} {clamp(b)}\n")

def save_p6(filename, width, height, data):
    """Guarda una imagen en formato PPM P6 (Binario)"""
    with open(os.path.join(OUTPUT_DIR, filename), "wb") as f:
        f.write(f"P6\n{width} {height}\n255\n".encode())
        f.write(data)

# --- IMÁGENES P3 (ASCII) ---

def img1_gradient_p3():
    # Degradado simple
    w, h = 256, 256
    pixels = []
    for y in range(h):
        for x in range(w):
            pixels.append((x, y, 128))
    save_p3("01_gradient.ppm", w, h, pixels)

def img2_checkerboard_p3():
    # Tablero de ajedrez
    w, h = 8, 8
    size = 1
    pixels = []
    for y in range(h):
        for x in range(w):
            if (x // size + y // size) % 2 == 0:
                pixels.append((255, 255, 255))
            else:
                pixels.append((0, 0, 0))
    save_p3("02_checkerboard.ppm", w, h, pixels)

# --- IMÁGENES P6 (BINARIO) ---

def img3_mandelbrot_p6():
    # Fractal de Mandelbrot básico
    w, h = 512, 512
    data = bytearray()
    for y in range(h):
        for x in range(w):
            cx = (x - w / 2) * 4 / w - 0.5
            cy = (y - h / 2) * 4 / h
            c = complex(cx, cy)
            z = 0j
            it = 0
            for i in range(100):
                if abs(z) > 2: break
                z = z*z + c
                it += 1
            data.extend([clamp(it * 2), clamp(it * 5), clamp(it * 10)])
    save_p6("03_mandelbrot.ppm", w, h, data)

def img4_plasma_p6():
    # Efecto de plasma matemático
    w, h = 512, 512
    data = bytearray()
    for y in range(h):
        for x in range(w):
            v = math.sin(x / 16.0) + math.sin(y / 16.0) + math.sin((x + y) / 16.0) + math.sin(math.sqrt(x*x + y*y) / 16.0)
            r = clamp((math.sin(v * math.pi) + 1) * 127)
            g = clamp((math.sin(v * math.pi + 2*math.pi/3) + 1) * 127)
            b = clamp((math.sin(v * math.pi + 4*math.pi/3) + 1) * 127)
            data.extend([r, g, b])
    save_p6("04_plasma.ppm", w, h, data)

def img5_circles_p6():
    # Círculos concéntricos
    w, h = 512, 512
    data = bytearray()
    for y in range(h):
        for x in range(w):
            d = math.sqrt((x - w/2)**2 + (y - h/2)**2)
            r = clamp(d % 64 * 4)
            g = clamp((d * 2) % 255)
            b = 150
            data.extend([r, g, b])
    save_p6("05_circles.ppm", w, h, data)

def img6_noise_p6():
    # Ruido pseudo-aleatorio
    w, h = 1080, 1080
    data = bytearray()
    a, b, c = 12.9898, 78.233, 43758.5453
    for y in range(h):
        for x in range(w):
            dt = x * a + y * b
            sn = dt % 3.14
            val = clamp((abs(math.sin(sn) * c) % 1) * 255)
            data.extend([val, val, val])
    save_p6("06_noise.ppm", w, h, data)

def img7_rgb_cube_p6():
    # Visualización del espacio de color RGB completo en 2D
    # Una cuadrícula de 8x8 donde cada celda aumenta el componente Azul
    w, h = 512, 512
    data = bytearray()
    for y in range(h):
        for x in range(w):
            # Determinar en qué celda de la cuadrícula estamos (0-7)
            grid_x, grid_y = x // 64, y // 64
            # Determinar la posición dentro de la celda (0-63)
            local_x, local_y = x % 64, y % 64
            
            r = clamp(local_x * 4)
            g = clamp(local_y * 4)
            # El azul aumenta con la posición de la celda en la cuadrícula
            b = clamp((grid_y * 8 + grid_x) * 4)
            
            data.extend([r, g, b])
    save_p6("07_rgb_cube.ppm", w, h, data)

def img8_sine_waves_p6():
    # Ondas de seno cruzadas
    w, h = 512, 512
    data = bytearray()
    for y in range(h):
        for x in range(w):
            r = clamp((math.sin(x / 20.0) + 1) * 127)
            g = clamp((math.cos(y / 20.0) + 1) * 127)
            b = clamp((math.sin((x+y) / 30.0) + 1) * 127)
            data.extend([r, g, b])
    save_p6("08_sine_waves.ppm", w, h, data)

def img9_diamond_p6():
    # Patrón de diamante
    w, h = 512, 512
    data = bytearray()
    for y in range(h):
        for x in range(w):
            val = abs(x - w/2) + abs(y - h/2)
            c = clamp(val % 255)
            data.extend([c, clamp(255 - c), 128])
    save_p6("09_diamond.ppm", w, h, data)

def img10_modern_art_p6():
    # "Arte moderno" geométrico
    w, h = 1024, 1024
    data = bytearray()
    for y in range(h):
        for x in range(w):
            r = clamp((x * y) % 256)
            g = clamp((x ^ y) % 256)
            b = clamp((x | y) % 256)
            data.extend([r, g, b])
    save_p6("10_modern_art.ppm", w, h, data)

def main():
    ensure_dir()
    print("Generando galería PPM...")
    img1_gradient_p3()
    img2_checkerboard_p3()
    img3_mandelbrot_p6()
    img4_plasma_p6()
    img5_circles_p6()
    img6_noise_p6()
    img7_rgb_cube_p6()
    img8_sine_waves_p6()
    img9_diamond_p6()
    img10_modern_art_p6()
    print(f"Hecho. 10 imágenes guardadas en {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
