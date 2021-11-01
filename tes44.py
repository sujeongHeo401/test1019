from sklearn.feature_extraction.text import TfidfVectorizer 
text = [
    'I go to my home my home is very large', 
    'I went out my home I go to the market', 
    'I bought a yellow lemon I go back to home'
    ] 
tfidf_vectorizer = TfidfVectorizer()
