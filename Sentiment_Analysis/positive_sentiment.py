import nltk
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
from wordcloud import WordCloud
import matplotlib.pyplot as plt


def positiveword(text):
    # Initialize the sentiment analyzer
    sia = SentimentIntensityAnalyzer()
    
    # Remove stop words from the text
    stop_words = set(stopwords.words('english'))
    words = nltk.word_tokenize(text)
    filtered_words = [word for word in words if word.lower() not in stop_words]
    filtered_text = ' '.join(filtered_words)
    
    # Analyze the sentiment of the filtered text
    sentiment = sia.polarity_scores(filtered_text)
    
    # Extract the positive words from the filtered text
    positive_words = [word for word in filtered_words if sia.polarity_scores(word)['compound'] > 0]
    
    # Generate a word cloud of the positive words
    positive_text = ' '.join(positive_words)
    wordcloud = WordCloud().generate(positive_text)
    
    # Display the word cloud
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis("off")
    plt.show()


def allword(text):
    # Initialize the sentiment analyzer
    sia = SentimentIntensityAnalyzer()

    # Remove stop words from the text
    stop_words = set(stopwords.words('english'))
    words = nltk.word_tokenize(text)
    filtered_words = [word for word in words if word.lower() not in stop_words]
    filtered_text = ' '.join(filtered_words)

    # Analyze the sentiment of the filtered text
    sentiment = sia.polarity_scores(filtered_text)

    # Print the sentiment analysis results
    print(sentiment)

    # Generate a word cloud of the filtered text
    wordcloud = WordCloud().generate(filtered_text)

    # Display the word cloud
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis("off")
    plt.show()