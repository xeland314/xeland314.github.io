import os
import numpy as np
import pyray as rl

WIDTH, HEIGHT = 800, 800
FPS = 1
DURATION = 10
MAX_FRAMES = DURATION
OUTPUT_DIR = "hilbert_frames"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)


def rot(n, x, y, rx, ry):
    if ry == 0:
        if rx == 1:
            x, y = n - 1 - x, n - 1 - y
        x, y = y, x
    return x, y


def d2xy(n, d):
    t, x, y = d, 0, 0
    s = 1
    while s < n:
        rx = 1 & (t // 2)
        ry = 1 & (t ^ rx)
        x, y = rot(s, x, y, rx, ry)
        x += s * rx
        y += s * ry
        t //= 4
        s *= 2
    return x, y


def main():
    rl.set_config_flags(rl.FLAG_WINDOW_HIDDEN)
    rl.init_window(WIDTH, HEIGHT, b"Hilbert")
    for i in range(MAX_FRAMES):
        order = i + 1  # De 1 a 10 orden
        n = 2**order
        total_points = n * n
        rl.begin_drawing()
        rl.clear_background(rl.BLACK)

        spacing = (WIDTH - 100) / n
        points = []
        for d in range(total_points):
            x, y = d2xy(n, d)
            points.append(
                rl.Vector2(
                    50 + x * spacing + spacing / 2,
                    50 + y * spacing + spacing / 2,
                )
            )

        for p in range(len(points) - 1):
            rl.draw_line_ex(points[p], points[p + 1], 2, rl.LIME)

        rl.end_drawing()
        img = rl.load_image_from_screen()
        with open(
            os.path.join(OUTPUT_DIR, f"frame_{i:04d}.ppm"), "wb"
        ) as f:
            pixels = np.frombuffer(
                rl.ffi.buffer(img.data, WIDTH * HEIGHT * 4)[:],
                dtype=np.uint8,
            ).reshape((HEIGHT, WIDTH, 4))
            f.write(
                f"""P6
{WIDTH} {HEIGHT}
255
""".encode()
                + pixels[:, :, :3].tobytes()
            )
        rl.unload_image(img)
    rl.close_window()


if __name__ == "__main__":
    main()
