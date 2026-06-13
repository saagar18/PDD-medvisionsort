import sys
from src.utils import setup_logger

logger = setup_logger("main")

MENU = """
╔════════════════════════════════════════╗
║        Medical Image Sorter            ║
╠════════════════════════════════════════╣
║  1. Train model                        ║
║     (uses dataset/train/ & test/)      ║
║                                        ║
║  2. Sort images from a folder          ║
║     (output → sorted/ct|xray|mri/)    ║
║                                        ║
║  3. Exit                               ║
╚════════════════════════════════════════╝
"""


def main():
    while True:
        print(MENU)
        choice = input("Enter choice (1-3): ").strip()

        if choice == "1":
            from src.train import train_model
            logger.info("Starting training...")
            train_model()

        elif choice == "2":
            from src.predict import sort_folder
            folder = input("  Enter folder path to sort: ").strip()
            if not folder:
                print("  ✗ No path entered.")
                continue
            sort_folder(folder)

        elif choice == "3":
            logger.info("Exiting.")
            sys.exit(0)

        else:
            print("  Invalid choice — enter 1, 2, or 3.")


if __name__ == "__main__":
    main()
