import math
import os
import numpy as np
import time
from concurrent.futures import ProcessPoolExecutor

# CONFIGURACIÓN
WIDTH, HEIGHT = 800, 800
FPS = 30
DURATION = 30
MAX_FRAMES = FPS * DURATION
OUTPUT_DIR = "flower_bloom_frames"
MAX_ITER = 80

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def save_ppm(filename, width, height, rgb_data):
    with open(filename, "wb") as f:
        header = f"P6\n{width} {height}\n255\n"
        f.write(header.encode())
        f.write(rgb_data.tobytes())


def get_julia_bloom(width, height, c, zoom=1.2):
    x = np.linspace(-zoom, zoom, width)
    y = np.linspace(-zoom, zoom, height)
    X, Y = np.meshgrid(x, y)
    z = X + 1j * Y
    img = np.zeros(z.shape, dtype=float)
    mask = np.full(z.shape, True, dtype=bool)
    for i in range(MAX_ITER):
        z[mask] = z[mask] ** 2 + c
        mask[np.abs(z) > 2] = False
        img[mask] = i
    return img


def colormap_flower(iterations):
    norm = iterations / MAX_ITER
    r = (255 * np.sin(norm * math.pi)).astype(np.uint8)
    g = (100 * (norm**2)).astype(np.uint8)
    b = (200 * norm).astype(np.uint8)
    return np.stack([r, g, b], axis=-1)


def render_frame(frame_idx):
    # CAMBIO CLAVE: Usamos el tiempo real basado en FPS original para que la velocidad sea constante
    # t = frame_idx / 300  # Si antes 300 cuadros eran 1 ciclo, mantenemos esa escala
    # O mejor, t representa segundos reales:
    t_seconds = frame_idx / FPS

    # Mantenemos la velocidad de rotación original (1 ciclo cada 10 segundos)
    angle = 2 * math.pi * (t_seconds / 10.0)

    radius = 0.7885
    c = radius * np.complex128(
        complex(math.cos(angle), math.sin(angle))
    )

    # El latido del zoom también basado en segundos reales
    zoom = 1.3 + 0.2 * math.sin(2 * math.pi * (t_seconds / 5.0))

    fractal_data = get_julia_bloom(WIDTH, HEIGHT, c, zoom)
    rgb_image = colormap_flower(fractal_data)
    filename = os.path.join(OUTPUT_DIR, f"frame_{frame_idx:04d}.ppm")
    save_ppm(filename, WIDTH, HEIGHT, rgb_image)
    return frame_idx


def main():
    print(
        f"Iniciando renderizado paralelo de {MAX_FRAMES} cuadros con tiempo corregido..."
    )
    start_time = time.time()
    with ProcessPoolExecutor() as executor:
        list(executor.map(render_frame, range(MAX_FRAMES)))
    end_time = time.time()
    total_time = end_time - start_time
    print(
        f"\n\u00a1Renderizado completado en {total_time:.2f} segundos!"
    )


if __name__ == "__main__":
    main()
