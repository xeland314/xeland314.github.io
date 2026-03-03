from concurrent.futures import ProcessPoolExecutor
import math
import os
import shutil
import time
import numpy as np


# CONFIGURACION
WIDTH, HEIGHT = 800, 800
FPS = 30
DURATION = 30
MAX_FRAMES = FPS * DURATION
VIDEO_NAME = "mandelbrot"
OUTPUT_DIR = f"{VIDEO_NAME}_frames"
MAX_ITER = 120

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_mandelbrot(width, height, x_min, x_max, y_min, y_max):
    x = np.linspace(x_min, x_max, width)
    y = np.linspace(y_min, y_max, height)
    X, Y = np.meshgrid(x, y)
    c = X + 1j * Y
    z = np.zeros(c.shape, dtype=complex)
    img = np.zeros(c.shape, dtype=float)
    mask = np.full(c.shape, True, dtype=bool)
    for i in range(MAX_ITER):
        z[mask] = z[mask] ** 2 + c[mask]
        mask[np.abs(z) > 2] = False
        img[mask] = i
    return img


def render_frame(i):
    target_x, target_y = -0.743643887, 0.131825904
    start_scale, end_scale = 1.5, 0.0001

    t = i / (MAX_FRAMES - 1)
    scale = start_scale * math.pow(end_scale / start_scale, t)

    data = get_mandelbrot(
        WIDTH,
        HEIGHT,
        target_x - scale,
        target_x + scale,
        target_y - scale,
        target_y + scale,
    )

    norm = data / MAX_ITER
    rgb = np.stack(
        [
            (255 * norm**0.5).astype(np.uint8),
            (255 * norm).astype(np.uint8),
            (255 * norm**2).astype(np.uint8),
        ],
        axis=-1,
    )

    filename = os.path.join(OUTPUT_DIR, f"frame_{i:04d}.ppm")
    with open(filename, "wb") as f:
        f.write(
            f"P6\n{WIDTH} {HEIGHT}\n255\n".encode() + rgb.tobytes()
        )
    return i


def main():
    print(
        f"Iniciando renderizado de Mandelbrot: {MAX_FRAMES} cuadros"
    )
    start_time = time.time()

    # Generar Frames
    with ProcessPoolExecutor() as executor:
        list(executor.map(render_frame, range(MAX_FRAMES)))

    # Generar video
    video_name = f"{VIDEO_NAME}.mp4"
    print(f"Generando video final: {video_name}")
    os.system(
        f"ffmpeg -y -framerate {FPS} "
        f"-i {output_subdir}/frame_%04d.ppm "
        f"-c:v libx264 -pix_fmt yuv420p {video_name} > /dev/null 2>&1"
    )
    shutil.rmtree(OUTPUT_DIR)

    end_time = time.time()
    print(f"Renderizado completado en {end_time - start_time:.2f} s")


if __name__ == "__main__":
    main()
