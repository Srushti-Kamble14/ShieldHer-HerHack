# Local risk model

`train_risk_model.py` creates the checked-in `synthetic_scenarios.csv` and fits
a four-class multinomial logistic-regression classifier with scikit-learn. The
generated dataset exhaustively covers 1,536 combinations of time of day,
travelling alone, situation, and the five existing safety indicators.

The class labels are generated from a transparent synthetic rubric based on
the current deterministic engine's factor weights and LOW/MODERATE/HIGH/
CRITICAL cutoffs. The classifier is genuinely fitted from these labeled
examples; the exported coefficients are produced by scikit-learn, not
hand-authored. Because the labels are synthetic and derived from a simple
rubric, this is a hackathon ML prototype—not clinically, security, or
real-world predictive intelligence, and not validated threat prediction.

To reproduce the dataset and model with Python 3.11+:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r backend\ml\requirements.txt
python backend\ml\train_risk_model.py
```

The training environment pins scikit-learn. The Node backend needs neither
Python nor scikit-learn; it reads `risk_model_v1.json` and performs softmax
inference directly in JavaScript. The artifact includes the version, exact
feature schema, learned class coefficients/intercepts, and score anchors.

The model's 0–100 output is an expected score over four learned class
probabilities, using anchors 12, 37, 62, and 87. Existing score thresholds
and recommendation text determine the returned risk level and recommendation.
Reported risk-factor contributions are differences between model predictions
with a present feature and a neutralized reference feature. These explain the
model's response to input features; they are not evidence of causation.

Latitude and longitude are intentionally excluded from features and training
data. Assessments are inferred in memory and are not written to a database,
training dataset, or external provider. User assessments must not be added to
the synthetic training data.
