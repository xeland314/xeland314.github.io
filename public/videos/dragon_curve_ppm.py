import math
import os
import numpy as np
import pyray as rl

WIDTH, HEIGHT = 800, 800
FPS = 1
DURATION = 10
MAX_FRAMES = DURATION
OUTPUT_DIR = "dragon_frames"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)


def get_dragon_points(iterations):
    points = [(0, 0), (1, 0)]
    for _ in range(iterations):
        last_x, last_y = points[-1]
        new_points = []
        for i in range(len(points) - 2, -1, -1):
            px, py = points[i]
            # Rotar 90 grados alrededor del último punto
            nx = last_x - (py - last_y)
            ny = last_y + (px - last_x)
            new_points.append((nx, ny))
        points.extend(new_points)
    return points


def main():
    rl.set_config_flags(rl.FLAG_WINDOW_HIDDEN)
    rl.init_window(WIDTH, HEIGHT, b"Dragon")
    for i in range(MAX_FRAMES):
        depth = i + 2  # De 2 a 11 iteraciones
        rl.begin_drawing()
        rl.clear_background(rl.BLACK)

        raw_points = get_dragon_points(depth)
        # Centrar y escalar
        xs = [p[0] for p in raw_points]
        ys = [p[1] for p in raw_points]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)

        scale = min(
            (WIDTH - 150) / (max_x - min_x + 1),
            (HEIGHT - 150) / (max_y - min_y + 1),
        )
        off_x = WIDTH / 2 - (min_x + max_x) * scale / 2
        off_y = HEIGHT / 2 - (min_y + max_y) * scale / 2

        for p in range(len(raw_points) - 1):
            p1 = rl.Vector2(
                off_x + raw_points[p][0] * scale,
                off_y + raw_points[p][1] * scale,
            )
            p2 = rl.Vector2(
                off_x + raw_points[p + 1][0] * scale,
                off_y + raw_points[p + 1][1] * scale,
            )
            rl.draw_line_ex(p1, p2, 2, rl.GOLD)

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
