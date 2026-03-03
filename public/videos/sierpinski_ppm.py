import os
import numpy as np
import pyray as rl

WIDTH, HEIGHT = 800, 800
FPS = 24
DURATION = 10
MAX_FRAMES = FPS * DURATION
OUTPUT_DIR = "sierpinski_frames"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)


def draw_sierpinski(p1, p2, p3, depth):
    if depth == 0:
        rl.draw_triangle(p1, p2, p3, rl.ORANGE)
    else:
        p12 = rl.Vector2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
        p23 = rl.Vector2((p2.x + p3.x) / 2, (p2.y + p3.y) / 2)
        p31 = rl.Vector2((p3.x + p1.x) / 2, (p3.y + p1.y) / 2)
        draw_sierpinski(p1, p12, p31, depth - 1)
        draw_sierpinski(p12, p2, p23, depth - 1)
        draw_sierpinski(p31, p23, p3, depth - 1)


def main():
    rl.set_config_flags(rl.FLAG_WINDOW_HIDDEN)
    rl.init_window(WIDTH, HEIGHT, b"Sierpinski")
    for i in range(MAX_FRAMES):
        t = i / MAX_FRAMES
        depth = int(1 + 7 * t)
        rl.begin_drawing()
        rl.clear_background(rl.BLACK)
        p1 = rl.Vector2(WIDTH / 2, 50)
        p2 = rl.Vector2(50, HEIGHT - 50)
        p3 = rl.Vector2(WIDTH - 50, HEIGHT - 50)
        draw_sierpinski(p1, p2, p3, depth)
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
