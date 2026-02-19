"""
FI-AdaBoost Regressor implementation
Required for unpickling the trained model
"""
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeRegressor


def weighted_median(preds_2d, weights):
    """Compute weighted median across predictions"""
    preds_2d = np.asarray(preds_2d, dtype=float)
    weights = np.asarray(weights, dtype=float)

    n_estimators, n_samples = preds_2d.shape
    out = np.empty(n_samples, dtype=float)

    wsum = np.sum(weights)
    if wsum <= 0:
        return np.median(preds_2d, axis=0)

    weights = weights / wsum

    for i in range(n_samples):
        p = preds_2d[:, i]
        order = np.argsort(p)
        p_sorted = p[order]
        w_sorted = weights[order]
        cw = np.cumsum(w_sorted)
        out[i] = p_sorted[np.searchsorted(cw, 0.5)]
    return out


class FIAdaBoostRegressor:
    """
    Feature Importance-weighted AdaBoost Regressor
    Custom implementation from your thesis
    """
    def __init__(self, n_estimators=50, max_depth=3, random_state=42, use_weighted_median=True):
        self.n_estimators = int(n_estimators)
        self.max_depth = int(max_depth)
        self.random_state = int(random_state)
        self.use_weighted_median = bool(use_weighted_median)
        self.estimators_ = []
        self.estimator_weights_ = []

    def fit(self, X, y):
        if not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)
        if not isinstance(y, (pd.Series, pd.DataFrame)):
            y = pd.Series(y)

        X_vals = np.asarray(X.values, dtype=float)
        y_vals = np.asarray(pd.Series(y).values, dtype=float)

        n_samples, n_features = X_vals.shape
        weights = np.ones(n_samples, dtype=float) / n_samples

        x_min = X_vals.min(axis=0)
        x_max = X_vals.max(axis=0)
        x_range = x_max - x_min
        x_range[x_range == 0] = 1.0
        X_norm = (X_vals - x_min) / x_range

        self.estimators_.clear()
        self.estimator_weights_.clear()

        for t in range(self.n_estimators):
            tree = DecisionTreeRegressor(
                max_depth=self.max_depth,
                random_state=self.random_state + t
            )
            tree.fit(X_vals, y_vals, sample_weight=weights)

            y_pred = tree.predict(X_vals)
            errors = np.abs(y_vals - y_pred)

            max_error = np.max(errors)
            if max_error <= 0:
                break

            e_norm = errors / max_error

            raw_fi = tree.feature_importances_
            fi_sum = np.sum(raw_fi)
            if fi_sum <= 0:
                phi_f = np.ones(n_features, dtype=float) / n_features
            else:
                phi_f = raw_fi / fi_sum

            phi_x = X_norm @ phi_f

            avg_error = np.sum(weights * e_norm)
            if avg_error >= 0.5:
                break

            beta_t = avg_error / (1.0 - avg_error)

            exponent = 1.0 - (e_norm * phi_x)
            weights = weights * np.power(beta_t, exponent)

            zt = np.sum(weights)
            if zt <= 0:
                break
            weights /= zt

            self.estimators_.append(tree)
            self.estimator_weights_.append(np.log(1.0 / (beta_t + 1e-12)))

        return self

    def predict(self, X):
        if not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)

        X_vals = np.asarray(X.values, dtype=float)

        if len(self.estimators_) == 0:
            return np.zeros(X_vals.shape[0], dtype=float)

        preds = np.array([est.predict(X_vals) for est in self.estimators_], dtype=float)
        w = np.asarray(self.estimator_weights_, dtype=float)

        if self.use_weighted_median:
            return weighted_median(preds, w)
        return np.average(preds, axis=0, weights=w)
