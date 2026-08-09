import nltk
from nltk import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

_nltk_ready = False


def ensure_nltk_data() -> None:
    global _nltk_ready
    if _nltk_ready:
        return

    for resource in ("punkt", "punkt_tab", "stopwords", "wordnet", "omw-1.4"):
        nltk.download(resource, quiet=True)

    _nltk_ready = True


def preprocess_review(text: str) -> str:
    ensure_nltk_data()

    stop_words = set(stopwords.words("english"))
    lemmatizer = WordNetLemmatizer()

    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stop_words]
    tokens = [lemmatizer.lemmatize(word, pos="v") for word in tokens]
    return " ".join(tokens)
