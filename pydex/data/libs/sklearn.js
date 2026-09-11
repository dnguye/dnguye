import { scene } from '../../js/explainer.js';

const fitExplainer = {
  hold: 3000,
  code: ['X_tr, X_te, y_tr, y_te = train_test_split(X, y)', 'scaler.fit(X_tr)         # learn from train only', 'model.fit(scaler.transform(X_tr), y_tr)', 'model.score(scaler.transform(X_te), y_te)'],
  build() {
    const s = scene(760, 320);
    const box = (id, x, y, w, label, cls = 'cell') => s.cell(id, x, y, w, 40, label, cls);
    box('data', 20, 30, 150, 'all rows (X, y)');
    box('train', 20, 120, 150, 'train 80%', 'cell hid');
    box('test', 20, 230, 150, 'test 20%', 'cell hid');
    s.arrow('s1', 95, 72, 95, 116, 'arrow hid'); s.arrow('s2', 130, 72, 130, 226, 'arrow hid');
    box('scaler', 240, 120, 150, 'scaler.fit', 'cell hid');
    box('model', 430, 120, 150, 'model.fit', 'cell hid');
    box('tx', 240, 230, 150, 'scaler.transform', 'cell hid');
    box('pred', 430, 230, 150, 'model.predict', 'cell hid');
    box('score', 620, 230, 120, 'score', 'cell hid');
    s.arrow('a1', 172, 140, 236, 140, 'arrow hid'); s.arrow('a2', 392, 140, 426, 140, 'arrow hid');
    s.arrow('a3', 172, 250, 236, 250, 'arrow hid'); s.arrow('a4', 392, 250, 426, 250, 'arrow hid'); s.arrow('a5', 582, 250, 616, 250, 'arrow hid');
    s.arrow('d1', 315, 162, 315, 226, 'arrow hid'); s.arrow('d2', 505, 162, 505, 226, 'arrow hid');
    s.text('n1', 315, 100, '', 'lbl sm ink-2'); s.text('n2', 505, 100, '', 'lbl sm ink-2'); s.text('n3', 680, 300, '', 'lbl sm ink-2');
    s.text('leak', 240, 300, '', 'lbl sm err-fill', undefined, 'start');
    return s;
  },
  steps: [
    { title: 'Split before you look', caption: 'Hold out a test set first. Anything you learn from the test rows, even the mean of a column, is leakage: your score will flatter you.', lines: [0],
      patch: { train: { cls: '' }, test: { cls: '' }, s1: { cls: 'arrow' }, s2: { cls: 'arrow' }, 'test.r': { cls: 'cell info' } } },
    { title: 'Fit the preprocessing on train only', caption: 'fit() computes the parameters: means and standard deviations for a scaler, categories for an encoder. Those numbers come from the training rows.', lines: [1],
      patch: { scaler: { cls: '' }, a1: { cls: 'arrow hot' }, 'scaler.r': { cls: 'cell hot' }, n1: { text: 'learns mean, std' } } },
    { title: 'Fit the model on transformed train data', caption: 'The estimator learns its weights. fit() always returns self, which is why the pipeline form chains.', lines: [2],
      patch: { model: { cls: '' }, a2: { cls: 'arrow hot' }, 'model.r': { cls: 'cell hot' }, n2: { text: 'learns weights' }, 'scaler.r': { cls: 'cell ok' } } },
    { title: 'Transform the test set with the same parameters', caption: 'Only transform(), never fit_transform(), on test data. The test rows are scaled with the training mean and std, exactly as new production rows will be.', lines: [3],
      patch: { tx: { cls: '' }, a3: { cls: 'arrow info' }, d1: { cls: 'arrow ok' }, 'model.r': { cls: 'cell ok' } } },
    { title: 'Predict and score', caption: 'The model sees test features it has never touched. The score is your honest estimate of performance on new data.', lines: [3],
      patch: { pred: { cls: '' }, score: { cls: '' }, a4: { cls: 'arrow info' }, a5: { cls: 'arrow info' }, d2: { cls: 'arrow ok' }, 'score.r': { cls: 'cell ok' }, n3: { text: 'honest estimate' } } },
    { title: 'The leak', caption: 'scaler.fit(X) on all rows before the split lets test statistics into training. Small here, catastrophic with target encoding or feature selection. Pipeline + cross_val_score makes the mistake impossible.', lines: [1],
      patch: { leak: { text: 'scaler.fit(X_all) → test information leaks into training' }, 'scaler.r': { cls: 'cell err' } } },
  ],
};

const cvExplainer = {
  hold: 2600,
  code: ['cross_val_score(pipe, X, y, cv=5)', '# 5 fits, 5 scores', 'scores.mean(), scores.std()'],
  build() {
    const s = scene(760, 300);
    const W = 100, H = 32;
    s.text('t', 20, 22, 'rows split into 5 folds', 'lbl bold', undefined, 'start');
    for (let round = 0; round < 5; round++) {
      s.text(`rl${round}`, 20, 58 + round * 44 + H / 2, `round ${round + 1}`, 'lbl sm ink-2 hid', undefined, 'start');
      for (let f = 0; f < 5; f++) s.cell(`f${round}${f}`, 90 + f * (W + 6), 58 + round * 44, W, H, `fold ${f + 1}`, round === 0 ? 'cell' : 'cell hid');
      s.cell(`sc${round}`, 630, 58 + round * 44, 110, H, '', 'cell ok hid');
    }
    s.text('mean', 685, 58 + 5 * 44 + 2, '', 'lbl sm bold');
    return s;
  },
  steps: [
    { title: 'Cut the data into k folds', caption: 'k=5 is common. StratifiedKFold (the default for classifiers) keeps the class balance in every fold.', lines: [0],
      patch: { rl0: { cls: 'lbl sm ink-2' } } },
    { title: 'Round 1: fold 1 is the test set', caption: 'The pipeline is fit on folds 2–5 and scored on fold 1. Preprocessing is re-fit inside each round, so nothing leaks.', lines: [0, 1],
      patch: { 'f00.r': { cls: 'cell info' }, sc0: { cls: '' }, 'sc0.t': { text: '0.93' } } },
    { title: 'Round 2: fold 2 is the test set', caption: 'A fresh clone of the estimator, trained from scratch. The previous round\'s weights are discarded.', lines: [1],
      patch: { rl1: { cls: 'lbl sm ink-2' }, f10: { cls: '' }, f11: { cls: '' }, f12: { cls: '' }, f13: { cls: '' }, f14: { cls: '' }, 'f11.r': { cls: 'cell info' }, sc1: { cls: '' }, 'sc1.t': { text: '0.90' } } },
    { title: 'Rounds 3, 4, 5', caption: 'Every row is used for testing exactly once and for training k−1 times.', lines: [1],
      patch: { rl2: { cls: 'lbl sm ink-2' }, rl3: { cls: 'lbl sm ink-2' }, rl4: { cls: 'lbl sm ink-2' },
        ...Object.fromEntries([2, 3, 4].flatMap(r => [0, 1, 2, 3, 4].map(f => [`f${r}${f}`, { cls: '' }]))),
        'f22.r': { cls: 'cell info' }, 'f33.r': { cls: 'cell info' }, 'f44.r': { cls: 'cell info' },
        sc2: { cls: '' }, 'sc2.t': { text: '0.97' }, sc3: { cls: '' }, 'sc3.t': { text: '0.93' }, sc4: { cls: '' }, 'sc4.t': { text: '0.90' } } },
    { title: 'Report the mean and the spread', caption: 'Five scores tell you both the expected performance and how much it depends on which rows you happened to test on. A single train/test split hides that.', lines: [2],
      patch: { mean: { text: 'mean 0.93 ± 0.03' } } },
  ],
};

export default {
  id: 'sklearn', name: 'scikit-learn', glyph: 'sk', group: 'ai', version: '1.5', keywords: 'machine learning model fit predict classifier regression pipeline cross validation',
  tagline: 'Classic machine learning with one consistent fit / predict API.',
  install: 'pip install scikit-learn', docs: 'https://scikit-learn.org/stable/', packages: ['scikit-learn', 'numpy'],
  overview: {
    what: 'scikit-learn covers supervised and unsupervised learning on tabular data: preprocessing, models, evaluation and tuning, all behind one interface. Every estimator has fit(); transformers add transform(); predictors add predict(). Pipelines chain them so the whole thing behaves like one estimator.',
    yes: ['Tabular data with hundreds to millions of rows.', 'Baselines you can explain: linear models, trees, forests, gradient boosting.', 'Cross-validation, grid search, metrics done right.', 'Preprocessing that must be reproduced exactly in production.'],
    no: ['Deep learning on images, audio, text embeddings (PyTorch, JAX).', 'Data that does not fit in memory (spark, dask-ml, or sample).', 'GPU training.'],
    note: 'The first snippet loads scikit-learn and scipy into the browser, which takes a moment. The bundled datasets (iris, diabetes) ship with the package.',
  },
  cheatsheet: [
    { id: 'api', title: 'The estimator API', snippets: [
      { title: 'Split, fit, predict, score', code: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0, stratify=y)

clf = LogisticRegression(max_iter=1000)
clf.fit(X_tr, y_tr)
print("accuracy:", clf.score(X_te, y_te))
print(clf.predict(X_te[:5]), y_te[:5])
print(clf.predict_proba(X_te[:1]).round(3))`, note: '<code>stratify=y</code> keeps class proportions in both halves. <code>random_state</code> makes the split reproducible.' },
      { title: 'Transformers: fit on train, transform both', code: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X, y = load_iris(return_X_y=True)
X_tr, X_te, _, _ = train_test_split(X, y, random_state=0)

scaler = StandardScaler().fit(X_tr)          # learns mean_ and scale_
print(scaler.mean_.round(2))
X_tr_s = scaler.transform(X_tr)
X_te_s = scaler.transform(X_te)              # never fit on test
print(X_tr_s.mean(axis=0).round(3), X_te_s.mean(axis=0).round(3))` },
    ] },
    { id: 'pipeline', title: 'Pipelines and mixed columns', snippets: [
      { title: 'Pipeline = one estimator', code: `from sklearn.datasets import load_iris
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score

X, y = load_iris(return_X_y=True)
pipe = make_pipeline(StandardScaler(), SVC(C=1.0))
scores = cross_val_score(pipe, X, y, cv=5)
print(scores.round(3), "mean", scores.mean().round(3), "±", scores.std().round(3))`, note: 'Inside each fold the scaler is re-fit on that fold\'s training part, so cross-validation stays leak-free.' },
      { title: 'ColumnTransformer for a DataFrame', code: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

df = pd.read_csv("/data/orders.csv")
X = df[["region", "rep", "quantity", "unit_price", "discount"]]
y = (df.status == "returned").astype(int)

pre = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["region", "rep"]),
    ("num", StandardScaler(), ["quantity", "unit_price", "discount"]),
])
model = Pipeline([("pre", pre), ("clf", LogisticRegression(class_weight="balanced", max_iter=500))])
print("balanced accuracy:", cross_val_score(model, X, y, cv=5, scoring="balanced_accuracy").mean().round(3))
model.fit(X, y)
print(model.named_steps["pre"].get_feature_names_out()[:6])`, packages: ['scikit-learn', 'pandas', 'numpy'], note: 'The sample returns are random, so expect a score near 0.5. The point is the shape of the code: categorical and numeric columns handled in one object.' },
    ] },
    { id: 'evaluate', title: 'Evaluate', snippets: [
      { title: 'Classification metrics', code: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=1, stratify=y)
rf = RandomForestClassifier(n_estimators=100, random_state=0).fit(X_tr, y_tr)
pred = rf.predict(X_te)
print(confusion_matrix(y_te, pred))
print(classification_report(y_te, pred, target_names=load_iris().target_names))
print("feature importance:", rf.feature_importances_.round(2))` },
      { title: 'Regression metrics', code: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score

X, y = load_diabetes(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=0)
for name, m in [("ridge", Ridge(alpha=1.0)), ("gbr", GradientBoostingRegressor(random_state=0))]:
    m.fit(X_tr, y_tr); p = m.predict(X_te)
    print(f"{name:6} MAE {mean_absolute_error(y_te, p):6.1f}   R² {r2_score(y_te, p):.3f}")` },
    ] },
    { id: 'tune', title: 'Tune', snippets: [
      { title: 'GridSearchCV over a pipeline', code: `from sklearn.datasets import load_iris
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV

X, y = load_iris(return_X_y=True)
pipe = Pipeline([("scale", StandardScaler()), ("svc", SVC())])
grid = {"svc__C": [0.1, 1, 10], "svc__gamma": ["scale", 0.1, 0.01]}   # step__param
gs = GridSearchCV(pipe, grid, cv=5, n_jobs=1).fit(X, y)
print(gs.best_params_, round(gs.best_score_, 3))
print(gs.best_estimator_)`, note: 'Parameter names are <code>step__param</code> with two underscores. <code>RandomizedSearchCV</code> samples the grid when it is large.' },
    ] },
    { id: 'unsupervised', title: 'Unsupervised', snippets: [
      { title: 'KMeans and PCA', code: `from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import numpy as np

X, true = make_blobs(n_samples=300, centers=4, cluster_std=0.9, random_state=2)
km = KMeans(n_clusters=4, n_init="auto", random_state=0).fit(X)
print("inertia", round(km.inertia_, 1), "centers", km.cluster_centers_.round(1).tolist()[:2])
print(np.bincount(km.labels_))
pca = PCA(n_components=2).fit(X)
print("explained variance", pca.explained_variance_ratio_.round(3))` },
    ] },
    { id: 'persist', title: 'Save and load', snippets: [
      { title: 'joblib', code: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
import joblib, os

X, y = load_iris(return_X_y=True)
clf = LogisticRegression(max_iter=1000).fit(X, y)
joblib.dump(clf, "/tmp/model.joblib")
loaded = joblib.load("/tmp/model.joblib")
print(os.path.getsize("/tmp/model.joblib"), "bytes;", loaded.predict(X[:3]))`, note: 'Pin the scikit-learn version in production; pickles are not guaranteed to load across versions.' },
    ] },
  ],
  concepts: [
    { id: 'fit', title: 'fit, transform, predict, and where leakage hides', intro: 'The order of these four calls is the whole discipline of supervised learning in scikit-learn.', explainer: fitExplainer },
    { id: 'cv', title: 'k-fold cross-validation', intro: 'Why <code>cross_val_score</code> returns five numbers and what to do with them.', explainer: cvExplainer },
  ],
  compare: [
    { title: 'Which model first', columns: ['Logistic / Linear', 'Decision tree', 'Random forest', 'Gradient boosting', 'kNN', 'SVM'], rows: [
      ['Needs scaling', true, false, false, false, true, true],
      ['Handles non-linear patterns', false, true, true, true, true, { part: 'with kernel' }],
      ['Interpretable', { dots: 5 }, { dots: 4 }, { dots: 2 }, { dots: 2 }, { dots: 1 }, { dots: 1 }],
      ['Accuracy on typical tabular data', { dots: 3 }, { dots: 2 }, { dots: 4 }, { dots: 5 }, { dots: 3 }, { dots: 4 }],
      ['Training speed', { dots: 5 }, { dots: 5 }, { dots: 3 }, { dots: 2 }, { dots: 5 }, { dots: 2 }],
      ['Works with few rows', { dots: 4 }, { dots: 3 }, { dots: 3 }, { dots: 3 }, { dots: 4 }, { dots: 4 }],
    ], verdict: 'Start with a linear model in a pipeline for a baseline, then try a random forest or gradient boosting (HistGradientBoosting handles NaN and scales well).' },
    { title: 'Which score', columns: ['accuracy', 'balanced accuracy', 'precision / recall / F1', 'ROC AUC', 'MAE', 'R²'], rows: [
      ['Task', 'classification', 'classification', 'classification', 'classification', 'regression', 'regression'],
      ['Safe on imbalanced classes', false, true, true, true, { part: 'n/a' }, { part: 'n/a' }],
      ['Needs probabilities', false, false, false, true, false, false],
      ['Units', 'fraction', 'fraction', 'fraction', 'fraction', 'same as y', 'unitless'],
    ] },
  ],
  gotchas: [
    { title: 'Fitting the scaler on all data', bad: `X_s = StandardScaler().fit_transform(X)
X_tr, X_te, ... = train_test_split(X_s, y)`, good: `X_tr, X_te, y_tr, y_te = train_test_split(X, y)
pipe = make_pipeline(StandardScaler(), model).fit(X_tr, y_tr)`, why: 'The test rows contributed to the mean and std the model trained with. A pipeline fits preprocessing only on whatever it is fit on.' },
    { title: 'Accuracy on an imbalanced target', bad: `# 97% of rows are class 0
clf.score(X_te, y_te)   # 0.97 for predicting "always 0"`, good: `from sklearn.metrics import balanced_accuracy_score, f1_score
balanced_accuracy_score(y_te, pred)`, why: 'Accuracy rewards the majority class. Use balanced accuracy, F1, or ROC AUC, and consider <code>class_weight="balanced"</code>.' },
    { title: 'Column order at predict time', bad: `model.fit(df[["a", "b"]], y)
model.predict(df[["b", "a"]])   # silently wrong`, good: `cols = ["a", "b"]
model.fit(df[cols], y); model.predict(new[cols])`, why: 'Estimators see positions, not names, unless the input is a DataFrame with <code>feature_names_in_</code>, and even then only a warning is raised in older versions. Keep one column list.' },
    { title: 'fit_transform on the test set', bad: `X_te = scaler.fit_transform(X_te)`, good: `X_te = scaler.transform(X_te)`, why: 'That re-learns the mean and std from the test rows, so train and test are no longer on the same scale.' },
  ],
  presets: [
    { title: 'Iris pipeline with grid search', code: `from sklearn.datasets import load_iris
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, train_test_split

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=0, stratify=y)
pipe = Pipeline([("scale", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])
gs = GridSearchCV(pipe, {"clf__C": [0.01, 0.1, 1, 10]}, cv=5).fit(X_tr, y_tr)
print(gs.best_params_, round(gs.best_score_, 3))
print("test accuracy", round(gs.score(X_te, y_te), 3))` },
  ],
};
