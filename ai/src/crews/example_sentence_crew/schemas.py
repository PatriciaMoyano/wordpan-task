from pydantic import BaseModel


class ExampleSentenceInput(BaseModel):
    """Input schema for example sentence generation."""
    word_english: str
    word_spanish: str
    user_name: str
    language_level: str
    learning_goal: str


class ExampleSentenceOutput(BaseModel):
    """Output schema for example sentence generation."""
    sentence_english: str
    sentence_spanish: str
    explanation: str
