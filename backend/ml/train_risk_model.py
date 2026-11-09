import csv
import itertools
import json
from pathlib import Path

from sklearn.linear_model import LogisticRegression


ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "synthetic_scenarios.csv"
MODEL_PATH = ROOT / "risk_model_v1.json"

TIMES = ("morning", "afternoon", "evening", "night")
SITUATIONS = ("walking", "public_transit", "rideshare", "waiting", "at_home", "other")
INDICATORS = (
    "isolated_area",
    "unsafe_person_nearby",
    "unfamiliar_route",
    "low_battery",
    "feeling_unsafe",
)
FEATURE_SCHEMA = (
    tuple(f"timeOfDay={value}" for value in TIMES)
    + ("travellingAlone=true",)
    + tuple(f"situation={value}" for value in SITUATIONS)
    + tuple(f"indicator={value}" for value in INDICATORS)
)
FEATURE_COLUMNS = (
    ("timeOfDay", "travellingAlone", "situation")
    + INDICATORS
)
CLASS_SCORE_ANCHORS = (12, 37, 62, 87)
LABEL_WEIGHTS = {
    "evening": 5,
    "night": 10,
    "travellingAlone": 10,
    "public_transit": 5,
    "rideshare": 10,
    "waiting": 5,
    "isolated_area": 15,
    "unsafe_person_nearby": 25,
    "unfamiliar_route": 10,
    "low_battery": 5,
    "feeling_unsafe": 15,
}


def build_dataset():
    rows = []
    for time_of_day, alone, situation, indicator_values in itertools.product(
        TIMES,
        (False, True),
        SITUATIONS,
        itertools.product((False, True), repeat=len(INDICATORS)),
    ):
        row = {
            "timeOfDay": time_of_day,
            "travellingAlone": alone,
            "situation": situation,
        }
        row.update(zip(INDICATORS, indicator_values))

        score = LABEL_WEIGHTS.get(time_of_day, 0)
        score += LABEL_WEIGHTS["travellingAlone"] if alone else 0
        score += LABEL_WEIGHTS.get(situation, 0)
        score += sum(
            LABEL_WEIGHTS[indicator]
            for indicator in INDICATORS
            if row[indicator]
        )
        row["riskLevel"] = (
            3 if score >= 75 else 2 if score >= 50 else 1 if score >= 25 else 0
        )
        rows.append(row)
    return rows


def encode(row):
    features = [
        int(row["timeOfDay"] == time_of_day) for time_of_day in TIMES
    ]
    features.append(int(row["travellingAlone"]))
    features.extend(
        int(row["situation"] == situation) for situation in SITUATIONS
    )
    features.extend(int(row[indicator]) for indicator in INDICATORS)
    return features


def write_dataset(rows):
    fieldnames = FEATURE_COLUMNS + ("riskLevel",)
    with DATASET_PATH.open("w", newline="", encoding="utf-8") as dataset_file:
        writer = csv.DictWriter(dataset_file, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    **row,
                    "travellingAlone": int(row["travellingAlone"]),
                    **{indicator: int(row[indicator]) for indicator in INDICATORS},
                }
            )


def train(rows):
    classifier = LogisticRegression(
        solver="lbfgs",
        max_iter=5000,
        random_state=17,
        C=1.0,
    )
    classifier.fit([encode(row) for row in rows], [row["riskLevel"] for row in rows])

    artifact = {
        "formatVersion": 1,
        "modelVersion": "1.0.0",
        "modelType": "sklearn-logistic-regression-multinomial",
        "trainingData": "synthetic_exhaustive_scenarios_v1",
        "trainingRows": len(rows),
        "featureSchema": list(FEATURE_SCHEMA),
        "classes": [int(value) for value in classifier.classes_],
        "classScoreAnchors": list(CLASS_SCORE_ANCHORS),
        "coefficients": classifier.coef_.tolist(),
        "intercepts": classifier.intercept_.tolist(),
    }
    MODEL_PATH.write_text(
        json.dumps(artifact, indent=2) + "\n", encoding="utf-8"
    )
    return classifier


def main():
    rows = build_dataset()
    write_dataset(rows)
    classifier = train(rows)
    print(
        f"Trained {classifier.__class__.__name__} on {len(rows)} synthetic scenarios; "
        f"wrote {DATASET_PATH.name} and {MODEL_PATH.name}."
    )


if __name__ == "__main__":
    main()
