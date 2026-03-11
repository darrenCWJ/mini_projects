def initialize_seating_plan():
    print("Welcome to Silver Screen Cinema Booking System!")
    print("=" * 50)
    
    while True:
        try:
            rows = int(input("Enter number of rows (3-10): "))
            if 3 <= rows <= 10:
                break
            else:
                print("Number of rows must be between 3 and 10 (inclusive).")
        except ValueError:
            print("Please enter a valid number.")
    
    while True:
        try:
            seats_per_row = int(input("Enter number of seats per row (3-10): "))
            if 3 <= seats_per_row <= 10:
                break
            else:
                print("Number of seats per row must be between 3 and 10 (inclusive).")
        except ValueError:
            print("Please enter a valid number.")
    
    # Create seating plan with all seats available ('O')
    seating_plan = []
    for _ in range(rows):
        row = ['O'] * seats_per_row
        seating_plan.append(row)
    
    print(f"\nSeating plan initialized: {rows} rows x {seats_per_row} seats")
    return seating_plan

def display_seating_plan(seating_plan):
    """
    Display the current seating plan in the specified format.
    """
    if not seating_plan:
        print("No seating plan available.")
        return
    
    rows = len(seating_plan)
    seats_per_row = len(seating_plan[0])
    
    print("\n     Screen")
    print(" " * 3 + " ".join([chr(65 + i) for i in range(seats_per_row)]))
    
    for i in range(rows):
        row_number = f"{i + 1:02d}"
        seats = " ".join(seating_plan[i])
        print(f"{row_number} {seats}")
    
    print()

def validate_booking_format(booking_input, max_rows, max_seats):
    """
    Validate the booking input format (@NN-#).
    Returns tuple (is_valid, error_type, seat_label, row_num, num_seats)
    Error types: 'format', 'row', 'seat', 'seats_count', 'already_booked', 'success'
    """
    if not booking_input or len(booking_input) < 5:
        return False, 'format', None, None, None
    
    try:
        # Expected format: @NN-# (e.g., C05-4)
        parts = booking_input.split('-')
        if len(parts) != 2:
            return False, 'format', None, None, None
        
        # Parse seat label and row number
        seat_part = parts[0]
        if len(seat_part) != 3:
            return False, 'format', None, None, None
        
        seat_label = seat_part[0]
        row_num_str = seat_part[1:3]
        
        # Validate seat label (A-Z)
        if not seat_label.isalpha() or not seat_label.isupper():
            return False, 'seat', None, None, None
        
        # Check if seat label is within bounds
        seat_index = ord(seat_label) - ord('A')
        if seat_index >= max_seats:
            return False, 'seat', None, None, None
        
        # Validate row number (01-99)
        row_num = int(row_num_str)
        if row_num < 1 or row_num > max_rows:
            return False, 'row', None, None, None
        
        # Validate number of seats
        num_seats = int(parts[1])
        if num_seats < 1:
            return False, 'seats_count', None, None, None
        
        # Check if requested seats are within bounds
        if seat_index + num_seats > max_seats:
            return False, 'seats_count', None, None, None
        
        return True, 'success', seat_label, row_num, num_seats
        
    except (ValueError, IndexError):
        return False, 'format', None, None, None

def book_seats(seating_plan):
    """
    Handle seat booking process.
    """
    print("\nCurrent seating plan:")
    display_seating_plan(seating_plan)
    
    rows = len(seating_plan)
    seats_per_row = len(seating_plan[0])
    
    while True:
        booking_input = input(f"Enter seats to book (eg C05-4) or 0 to cancel): ").strip()
        
        if booking_input == '0':
            return
        
        # Validate format and bounds
        is_valid, error_type, seat_label, row_num, num_seats = validate_booking_format(booking_input, rows, seats_per_row)
        
        if not is_valid:
            if error_type == 'format':
                print("Invalid input! Please enter in @NN-# format where @:seat label, NN:row, #:number of seats")
            elif error_type == 'row':
                print("Invalid row! Please enter in @NN-# format where @:seat label, NN:row, #:number of seats")
            elif error_type == 'seat':
                print("Invalid seat label! Please enter in @NN-# format where @:seat label, NN:row, #:number of seats")
            elif error_type == 'seats_count':
                print("Invalid number of seats! Please enter in @NN-# format where @:seat label, NN:row, #:number of seats")
            continue
        
        # Check if all requested seats are available
        row_index = row_num - 1
        seat_index = ord(seat_label) - ord('A')
        all_available = True
        for i in range(seat_index, seat_index + num_seats):
            if seating_plan[row_index][i] == 'X':
                all_available = False
                break
        
        if not all_available:
            print("Some seats are already booked! Please choose different seats.")
            continue
        
        # Book the seats
        for i in range(seat_index, seat_index + num_seats):
            seating_plan[row_index][i] = 'X'
        
        print("Seats booked")
        print("\nUpdated seating plan:")
        display_seating_plan(seating_plan)
        break


def find_best_seats(seating_plan, num_seats):
    """
    Find the best seats for booking starting from the last row and working forward.
    Returns list of tuples (row_index, start_seat_index) representing best seat options,
    ranked by preference (last rows first, then center positions).
    """
    rows = len(seating_plan)
    seats_per_row = len(seating_plan[0])
    best_options = []
    
    # Start from the last row and work forward towards the screen
    for row_index in range(rows - 1, -1, -1):
        row = seating_plan[row_index]
        
        # Calculate center position for this row
        center_pos = seats_per_row // 2
        
        # Try to find continuous seats starting from center and expanding outward
        for distance in range(seats_per_row):
            # Try positions: center, center-1, center+1, center-2, center+2, etc.
            positions_to_try = []
            if distance == 0:
                positions_to_try = [center_pos]
            else:
                positions_to_try = [center_pos - distance, center_pos + distance]
            
            for start_pos in positions_to_try:
                # Check if we can fit num_seats starting at start_pos
                if start_pos >= 0 and start_pos + num_seats <= seats_per_row:
                    # Check if all seats in this range are available
                    all_available = True
                    for i in range(start_pos, start_pos + num_seats):
                        if row[i] == 'X':
                            all_available = False
                            break
                    
                    if all_available:
                        best_options.append((row_index, start_pos))
    
    return best_options

def get_seat_notation(row_index, seat_index, num_seats):
    """
    Convert row and seat indices to seat notation (e.g., "C05-3").
    """
    row_num = row_index + 1
    seat_label = chr(65 + seat_index)  # A, B, C, etc.
    return f"{seat_label}{row_num:02d}-{num_seats}"

def display_selected_seats(seating_plan, row_index, start_seat_index, num_seats):
    """
    Display the seating plan with the selected seats highlighted.
    """
    rows = len(seating_plan)
    seats_per_row = len(seating_plan[0])
    
    print("\n     Screen")
    print(" " * 3 + " ".join([chr(65 + i) for i in range(seats_per_row)]))
    
    for i in range(rows):
        row_number = f"{i + 1:02d}"
        row_display = []
        
        for j in range(seats_per_row):
            if i == row_index and start_seat_index <= j < start_seat_index + num_seats:
                row_display.append('*')  # Use * to highlight selected seats
            else:
                row_display.append(seating_plan[i][j])
        
        seats = " ".join(row_display)
        print(f"{row_number} {seats}")
    
    print("(* = Selected seats)")
    print()

def auto_select_best_seats(seating_plan):
    """
    Handle auto-selection of best seats.
    """
    while True:
        try:
            num_seats = int(input("Enter number of seats (0 to cancel): "))
            if num_seats == 0:
                return
            if num_seats < 1:
                print("Please enter a positive number.")
                continue
            break
        except ValueError:
            print("Please enter a valid number.")
    
    # Find best seat options
    best_options = find_best_seats(seating_plan, num_seats)
    
    if not best_options:
        print(f"No {num_seats} continuous seats available.")
        return
    
    # Show each option until user accepts or no more options
    option_index = 0
    while option_index < len(best_options):
        row_index, start_seat_index = best_options[option_index]
        
        # Display seating plan with selected seats
        display_seating_plan_with_selection(seating_plan, row_index, start_seat_index, num_seats)
        
        # Create seat range notation (e.g., "A03 to E03")
        start_seat_label = chr(65 + start_seat_index)
        end_seat_label = chr(65 + start_seat_index + num_seats - 1)
        row_num = f"{row_index + 1:02d}"
        seat_range = f"{start_seat_label}{row_num} to {end_seat_label}{row_num}"
        
        while True:
            choice = input(f"Would you like to book the seats {seat_range} (y/n or 0 to cancel): ").strip().lower()
            if choice == '0':
                return
            elif choice == 'y':
                # Book the seats
                for i in range(start_seat_index, start_seat_index + num_seats):
                    seating_plan[row_index][i] = 'X'
                
                print("Seats booked")
                return
            elif choice == 'n':
                option_index += 1
                break
            else:
                print("Please enter 'y' for yes, 'n' for next option, or '0' to cancel.")
    
    print("No more suitable seats available.")

def display_seating_plan_with_selection(seating_plan, row_index, start_seat_index, num_seats):
    """
    Display the seating plan with the selected seats highlighted.
    """
    rows = len(seating_plan)
    seats_per_row = len(seating_plan[0])
    
    print("Screen")
    print(" " * 3 + " ".join([chr(65 + i) for i in range(seats_per_row)]))
    
    for i in range(rows):
        row_number = f"{i + 1:02d}"
        row_display = []
        
        for j in range(seats_per_row):
            if i == row_index and start_seat_index <= j < start_seat_index + num_seats:
                row_display.append('*')  # Use * to highlight selected seats
            else:
                row_display.append(seating_plan[i][j])
        
        seats = " ".join(row_display)
        print(f"{row_number} {seats}")
    print()

def display_menu():
    """
    Display the main menu options.
    """
    print("Booking Menu")
    print("_" * 12)
    print("1. Show seats")
    print("2. Book seats")
    print("3. Auto select seats")
    print("0. Quit")
    print("_" * 12)

def get_menu_choice():
    """
    Get and validate menu choice from user.
    """
    while True:
        try:
            choice = int(input("Enter option: "))
            if choice in [0, 1, 2, 3]:
                return choice
            else:
                print("Please enter a number between 0 and 3.")
        except ValueError:
            print("Please enter a valid number.")

def main():
    """
    Main function to run the cinema booking application.
    """

    # Initialize seating plan
    seating_plan = initialize_seating_plan()
    
    # Main menu loop
    while True:
        display_menu()
        choice = get_menu_choice()
        
        if choice == 1:
            display_seating_plan(seating_plan)
        elif choice == 2:
            book_seats(seating_plan)
        elif choice == 3:
            auto_select_best_seats(seating_plan)
        elif choice == 0:
            print("Program end")
            break

if __name__ == "__main__":
    main()
