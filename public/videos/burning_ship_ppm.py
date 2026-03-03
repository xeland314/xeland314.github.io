import math
import os
import numpy as np

# CONFIGURATION
WIDTH, HEIGHT = 800, 800
FPS = 24
DURATION = 10
MAX_FRAMES = FPS * DURATION
OUTPUT_DIR = "burning_ship_frames"
MAX_ITER = 100

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def save_ppm(filename, width, height, rgb_data):
    """Saves RGB data to a PPM P6 file."""
    with open(filename, "wb") as f:
        header = f"""P6
{width} {height}
255
"""
        f.write(header.encode())
        f.write(rgb_data.tobytes())


def get_burning_ship(
    width, height, x_min, x_max, y_min, y_max, max_iter
):
    """Calculates the Burning Ship fractal using numpy."""
    x = np.linspace(x_min, x_max, width)
    y = np.linspace(y_min, y_max, height)
    X, Y = np.meshgrid(x, y)

    c = X + 1j * Y
    z = np.zeros(c.shape, dtype=complex)
    img = np.zeros(c.shape, dtype=int)
    mask = np.full(c.shape, True, dtype=bool)

    for i in range(max_iter):
        # Burning Ship formula: z = (|Re(z)| + i|Im(z)|)^2 + c
        # Which expands to:
        # Re(z_next) = Re(z)^2 - Im(z)^2 + Re(c)
        # Im(z_next) = 2 * |Re(z) * Im(z)| + Im(c)
        # (Note: taking absolute values before squaring/multiplying)

        z_re = np.abs(z.real)
        z_im = np.abs(z.imag)

        z[mask] = (z_re[mask] + 1j * z_im[mask]) ** 2 + c[mask]

        mask[np.abs(z) > 2] = False
        img[mask] = i

    return img


def colormap(iterations, max_iter):
    """Simple colormap for the fractal."""
    # Normalized iterations 0..1
    norm = iterations / max_iter

    # Create some colors (R, G, B)
    # Burning ship looks good with fire colors: Red, Orange, Yellow
    r = (255 * norm).astype(np.uint8)
    g = (255 * (norm**2)).astype(np.uint8)
    b = (255 * (norm**4)).astype(np.uint8)

    # Stack them to get RGB
    return np.stack([r, g, b], axis=-1)


def main():
    # Zoom parameters
    # The "Ship" is around x=-1.75, y=-0.03
    target_x = -1.755
    target_y = -0.04

    start_scale = 2.0
    end_scale = 0.005

    print(
        f"Generating {MAX_FRAMES} frames of Burning Ship Fractal..."
    )

    for frame_idx in range(MAX_FRAMES):
        # Exponential zoom
        t = frame_idx / (MAX_FRAMES - 1)
        # scale = start_scale * (end_scale / start_scale) ** t
        # Smoother zoom using ease-in-out or just simple power
        scale = start_scale * math.pow(end_scale / start_scale, t)

        x_min = target_x - scale
        x_max = target_x + scale
        y_min = target_y - scale
        y_max = target_y + scale

        # Calculate fractal
        fractal_data = get_burning_ship(
            WIDTH, HEIGHT, x_min, x_max, y_min, y_max, MAX_ITER
        )

        # Apply colormap
        rgb_image = colormap(fractal_data, MAX_ITER)

        # Save PPM
        filename = os.path.join(
            OUTPUT_DIR, f"frame_{frame_idx:04d}.ppm"
        )
        save_ppm(filename, WIDTH, HEIGHT, rgb_image)

        if frame_idx % 24 == 0:
            print(
                f"Progress: {frame_idx}/{MAX_FRAMES} frames "
                f"({(frame_idx / MAX_FRAMES) * 100:.1f}%)"
            )

    print(f"Done! Frames saved in {OUTPUT_DIR}")
    print("To create the video, run:")
    print(
        f"ffmpeg -framerate {FPS} -i "
        f"{OUTPUT_DIR}/frame_%04d.ppm -c:v libx264 "
        "-pix_fmt yuv420p burning_ship.mp4"
    )


if __name__ == "__main__":
    main()
