import math
import os
import numpy as np
import pyray as rl

WIDTH, HEIGHT = 800, 800
FPS = 1
DURATION = 10
MAX_FRAMES = DURATION
OUTPUT_DIR = "koch_frames"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)


def save_ppm(filename, width, height, data):
    with open(filename, "wb") as f:
        f.write(
            f"""P6
{width} {height}
255
""".encode()
        )
        pixels = np.frombuffer(data, dtype=np.uint8).reshape(
            (height, width, 4)
        )
        f.write(pixels[:, :, :3].tobytes())


def draw_koch_line(p1, p2, depth):
    if depth == 0:
        rl.draw_line_v(p1, p2, rl.SKYBLUE)
    else:
        dx, dy = (p2.x - p1.x) / 3, (p2.y - p1.y) / 3
        a = rl.Vector2(p1.x + dx, p1.y + dy)
        c = rl.Vector2(p1.x + 2 * dx, p1.y + 2 * dy)

        # Pico del triángulo equilátero
        angle = -math.pi / 3
        s, c_val = math.sin(angle), math.cos(angle)
        bx = (c.x - a.x) * c_val - (c.y - a.y) * s + a.x
        by = (c.x - a.x) * s + (c.y - a.y) * c_val + a.y
        b = rl.Vector2(bx, by)

        draw_koch_line(p1, a, depth - 1)
        draw_koch_line(a, b, depth - 1)
        draw_koch_line(b, c, depth - 1)
        draw_koch_line(c, p2, depth - 1)


def main():
    rl.set_config_flags(rl.FLAG_WINDOW_HIDDEN)
    rl.init_window(WIDTH, HEIGHT, b"Koch")
    for i in range(MAX_FRAMES):
        depth = i  # De 0 a 9 iteraciones
        rl.begin_drawing()
        rl.clear_background(rl.BLACK)

        # Triángulo inicial
        size = 500
        p1 = rl.Vector2(WIDTH / 2, HEIGHT / 2 - 280)
        p2 = rl.Vector2(WIDTH / 2 - 250, HEIGHT / 2 + 150)
        p3 = rl.Vector2(WIDTH / 2 + 250, HEIGHT / 2 + 150)

        draw_koch_line(p1, p3, depth)
        draw_koch_line(p3, p2, depth)
        draw_koch_line(p2, p1, depth)

        rl.end_drawing()
        img = rl.load_image_from_screen()
        save_ppm(
            os.path.join(OUTPUT_DIR, f"frame_{i:04d}.ppm"),
            WIDTH,
            HEIGHT,
            rl.ffi.buffer(img.data, WIDTH * HEIGHT * 4)[:],
        )
        rl.unload_image(img)
    rl.close_window()


if __name__ == "__main__":
    main()
