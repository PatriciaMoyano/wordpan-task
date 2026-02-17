import os
from pathlib import Path
from crewai import Agent, Crew, Task, Process
import yaml

from ..base.llm import DEFAULT_LLM
from .schemas import ExampleSentenceInput, ExampleSentenceOutput


class ExampleSentenceCrew:
    """CrewAI crew for generating example sentences for vocabulary learning."""

    def __init__(self):
        """Initialize the ExampleSentenceCrew with agents and tasks."""
        config_dir = Path(__file__).parent / "config"

        # Load agent configurations
        with open(config_dir / "agents.yaml", "r") as f:
            agents_config = yaml.safe_load(f)

        # Load task configurations
        with open(config_dir / "tasks.yaml", "r") as f:
            tasks_config = yaml.safe_load(f)

        # Initialize agent
        self.language_teacher = Agent(
            config=agents_config["language_teacher"],
            verbose=True,
            llm=DEFAULT_LLM,
        )

        # Initialize task
        self.generate_example_sentence_task = Task(
            config=tasks_config["generate_example_sentence"],
            agent=self.language_teacher,
            output_pydantic=ExampleSentenceOutput,
        )

    def run(self, inputs: ExampleSentenceInput) -> ExampleSentenceOutput:
        """
        Run the crew to generate an example sentence.

        Args:
            inputs: ExampleSentenceInput with word and user context

        Returns:
            ExampleSentenceOutput with sentence, translation, and explanation
        """
        crew = Crew(
            agents=[self.language_teacher],
            tasks=[self.generate_example_sentence_task],
            process=Process.sequential,
            verbose=True,
        )

        result = crew.kickoff(inputs=inputs.model_dump())
        return result.pydantic
