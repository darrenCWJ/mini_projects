import random
import sys

def get_player_names():
    """Get unique player names (2+ players)"""
    player_names = []
    player_num = 1
    
    while True:
        name = input(f"Enter player {player_num}'s name (empty to end): ").strip()
        
        if not name:  # Empty input
            if len(player_names) < 2:
                print("Please enter at least 2 players")
                continue
            else:
                break  # End of player entry
        
        if name in player_names:
            print("Player names must be unique")
            continue
        
        player_names.append(name)
        player_num += 1
    
    return player_names

def shuffle_players(players):
    """Shuffle the player order"""
    shuffled = players.copy()
    random.shuffle(shuffled)
    return shuffled

def initialize_game():
    """Initialize the game with players and scores"""
    player_names = get_player_names()
    players = shuffle_players(player_names)
    
    # Initialize all players with 501 points
    player_scores = {}
    for player in players:
        player_scores[player] = 501
    
    return players, player_scores

def get_hit_points(player, round_num):
    """Get hit points from player (1-20 or 25)"""
    while True:
        try:
            hit_points = int(input(f"{player}'s round {round_num}, choose a number from 1 to 20 inclusive, or 25: "))
            if hit_points in range(1, 21) or hit_points == 25:
                return hit_points
            else:
                print("Please choose a number between 1-20 or 25.")
        except ValueError:
            print("Please enter a valid number.")

def get_multiplier(hit_points):
    """Get random multiplier based on hit points"""
    if hit_points == 25:
        return random.choice([1, 2])
    else:  # hit_points 1-20
        return random.choice([1, 2, 3])

def get_multiplier_text(multiplier):
    """Convert multiplier to text"""
    if multiplier == 1:
        return "single"
    elif multiplier == 2:
        return "double"
    elif multiplier == 3:
        return "triple"

def is_bust(current_score, hit_points, multiplier):
    """Check if the move would result in a bust"""
    new_score = current_score - (hit_points * multiplier)
    
    # Bust conditions:
    # 1. Negative score
    if new_score < 0:
        return True
    
    # 2. Zero score but multiplier is not 2
    if new_score == 0 and multiplier != 2:
        return True
    
    # 3. Score of 1 (cannot reach 0 with multiplier 2 next round)
    if new_score == 1:
        return True
    
    return False

def play_round(player, round_num, player_scores):
    """Play one round for a player"""
    current_score = player_scores[player]
    
    # Get hit points from player
    hit_points = get_hit_points(player, round_num)
    
    # Get random multiplier
    multiplier = get_multiplier(hit_points)
    multiplier_text = get_multiplier_text(multiplier)
    
    # Calculate new score
    deduction = hit_points * multiplier
    new_score = current_score - deduction
    
    # Display result
    print(f"It's a {multiplier_text}, total {multiplier}x{hit_points}={deduction} points, {player}'s new score is {new_score} points")
    
    # Check for bust
    if is_bust(current_score, hit_points, multiplier):
        print(f"BUST! {player}'s score reverts to {player_scores[player]}")
        return False, True, player_scores  # No win, bust occurred
    
    # Update score
    player_scores[player] = new_score
    
    # Check for win (exactly 0 with multiplier 2)
    if new_score == 0 and multiplier == 2:
        return True, False, player_scores  # Win, no bust
    
    return False, False, player_scores  # No win, no bust

def play_turn(player, turn_count, player_scores):
    """Play a complete turn (up to 3 rounds) for a player"""
    current_score = player_scores[player]
    print(f"{player}'s turn {turn_count + 1}, current score is {current_score} points")
    
    for round_num in range(3):
        won, busted, player_scores = play_round(player, round_num + 1, player_scores)
        
        if won:
            return True, player_scores, player  # Win
        
        if busted:
            print(f"Turn ends due to bust.")
            break
    
    print("Next player...")
    return False, player_scores, None  # No win

def display_final_scores(players, player_scores, winner, turn_count):
    """Display final scores after someone wins"""
    print(f"\n{winner} wins in {turn_count + 1} turns!")
    
    for player in players:
        print(f"{player}'s score is {player_scores[player]}")

def play_game():
    """Main game loop"""
    players, player_scores = initialize_game()
    turn_count = 0
    winner = None
    
    while winner is None:
        # Play one complete round (all players get one turn)
        for player in players:
            won, player_scores, winner = play_turn(player, turn_count, player_scores)
            
            if won:
                display_final_scores(players, player_scores, winner, turn_count)
                break
        
        # Increment turn count after all players have had their turn
        if not winner:
            turn_count += 1
        
        if winner:
            break

def main():
    """Main function to run the game"""
    try:
        play_game()
    except KeyboardInterrupt:
        print("\n\nGame interrupted by user. Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()