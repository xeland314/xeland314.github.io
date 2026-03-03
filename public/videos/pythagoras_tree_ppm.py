import math
import os
import numpy as np
import pyray as rl

# CONFIGURATION
WIDTH, HEIGHT = 800, 800
FPS = 24
DURATION = 10
MAX_FRAMES = FPS * DURATION
OUTPUT_DIR = "pythagoras_tree_frames"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def save_ppm(filename, width, height, image_data):
    """Saves Raylib image data to PPM P6."""
    with open(filename, "wb") as f:
        header = f"""P6
{width} {height}
255
"""
        f.write(header.encode())
        # image_data is RGBA, we need RGB
        pixels = np.frombuffer(image_data, dtype=np.uint8).reshape(
            (height, width, 4)
        )
        f.write(pixels[:, :, :3].tobytes())


def draw_pythagoras_tree(x, y, size, angle, depth, tilt_angle):
    if depth == 0:
        return

    # Calculate vertices of the square growing UP
    # base vector along the bottom of the square
    dx = size * math.cos(angle)
    dy = size * math.sin(angle)

    # perpendicular vector going "up" (subtracting from Y in Raylib)
    ux = size * math.sin(angle)
    uy = -size * math.cos(angle)

    p1 = rl.Vector2(x, y)
    p2 = rl.Vector2(x + dx, y + dy)
    p3 = rl.Vector2(p2.x + ux, p2.y + uy)
    p4 = rl.Vector2(p1.x + ux, p1.y + uy)

    # Draw the square
    color = rl.color_from_hsv(depth * 30, 0.6, 0.9)
    thickness = max(1.0, depth * 0.5)
    rl.draw_line_ex(p1, p2, thickness, color)
    rl.draw_line_ex(p2, p3, thickness, color)
    rl.draw_line_ex(p3, p4, thickness, color)
    rl.draw_line_ex(p4, p1, thickness, color)

    # Calculate the top triangle vertex p5
    alpha = tilt_angle
    size_left = size * math.cos(alpha)
    size_right = size * math.sin(alpha)

    # The left branch starts at p4 at angle (angle - alpha)
    # The right branch starts at p5 at angle (angle + pi/2 - alpha)
    p5 = rl.Vector2(
        p4.x + size_left * math.cos(angle - alpha),
        p4.y + size_left * math.sin(angle - alpha),
    )

    # Recursive calls
    draw_pythagoras_tree(
        p4.x, p4.y, size_left, angle - alpha, depth - 1, tilt_angle
    )
    draw_pythagoras_tree(
        p5.x,
        p5.y,
        size_right,
        angle + (math.pi / 2 - alpha),
        depth - 1,
        tilt_angle,
    )


def main():
    rl.set_config_flags(rl.FLAG_WINDOW_HIDDEN)
    rl.init_window(WIDTH, HEIGHT, b"Pythagoras Tree Animation")

    print(f"Generating {MAX_FRAMES} frames of Pythagoras Tree...")

    for frame_idx in range(MAX_FRAMES):
        # Animate the tilt angle (swaying effect)
        # t goes from 0 to 1
        t = frame_idx / MAX_FRAMES
        # Cycle angle between 30 and 60 degrees (in radians)
        current_tilt = (math.pi / 4) + (math.pi / 12) * math.sin(
            2 * math.pi * t
        )

        rl.begin_drawing()
        rl.clear_background(rl.BLACK)

        # Draw the tree from the bottom center
        # Base size 120, starting at bottom
        draw_pythagoras_tree(
            WIDTH // 2 - 60, HEIGHT - 50, 120, 0, 10, current_tilt
        )

        rl.draw_text(
            f"FRAME: {frame_idx}/{MAX_FRAMES}".encode(),
            20,
            20,
            20,
            rl.RAYWHITE,
        )
        rl.end_drawing()

        # Capture and save
        img = rl.load_image_from_screen()
        pixel_data = rl.ffi.buffer(img.data, WIDTH * HEIGHT * 4)[:]
        filename = os.path.join(
            OUTPUT_DIR, f"frame_{frame_idx:04d}.ppm"
        )
        save_ppm(filename, WIDTH, HEIGHT, pixel_data)
        rl.unload_image(img)

        if frame_idx % 24 == 0:
            print(
                f"Progress: {frame_idx}/{MAX_FRAMES} frames "
                f"({(frame_idx / MAX_FRAMES) * 100:.1f}%)"
            )

    rl.close_window()
    print(f"Done! Frames saved in {OUTPUT_DIR}")
    print("To create the video, run:")
    print(
        f"ffmpeg -framerate {FPS} -i {OUTPUT_DIR}/frame_%04d.ppm "
        "-c:v libx264 -pix_fmt yuv420p pythagoras_tree.mp4"
    )


if __name__ == "__main__":
    main()
