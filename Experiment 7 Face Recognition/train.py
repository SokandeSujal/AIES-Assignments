import os
from random import shuffle
from sklearn import svm, neighbors
import pickle
import numpy as np
import pandas as pd
from datetime import datetime


def backup_file_if_exists(file_path):
    if not os.path.isfile(file_path):
        return

    backup_path = "{}.bak".format(file_path)
    if os.path.exists(backup_path):
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        backup_path = "{}.{}".format(backup_path, timestamp)

    print('\x1b[0;37;43m' + "{} already exists. Backing up to {}.".format(file_path, backup_path) + '\x1b[0m')
    os.replace(file_path, backup_path)

encoding_file_path = './encoded-images-data.csv'
labels_fName = 'labels.pkl'

if os.path.isfile(encoding_file_path):
    df = pd.read_csv(encoding_file_path)
else:
    print('\x1b[0;37;41m' + '{} does not exist'.format(encoding_file_path) + '\x1b[0m')
    quit()

if os.path.isfile(labels_fName):
    with open(labels_fName, 'rb') as f:
        le = pickle.load(f)
else:
    print('\x1b[0;37;41m' + '{} does not exist'.format(labels_fName) + '\x1b[0m')
    quit()

# Read the dataframe into a numpy array
# shuffle the dataset
full_data = np.array(df.astype(float).values.tolist())
shuffle(full_data)

# Extract features and labels
# remove id column (0th column)
X = np.array(full_data[:, 1:-1])
y = np.array(full_data[:, -1:])

# fit the data into a support vector machine
# clf = svm.SVC(C=1, kernel='linear', probability=True)
clf = neighbors.KNeighborsClassifier(n_neighbors=3, algorithm='ball_tree', weights='distance')
clf.fit(X, y.ravel())


fName = "./classifier.pkl"
backup_file_if_exists(fName)

# save the classifier pickle
with open(fName, 'wb') as f:
    pickle.dump((le, clf), f)
print('\x1b[6;30;42m' + "Saving classifier to '{}'".format(fName) + '\x1b[0m')

