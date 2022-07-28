# -*- coding: utf-8 -*-
"""
https://stackoverflow.com/questions/33745746/split-violinplot-in-seaborn-with-hue-parameter
"""

import pandas as pd
import seaborn as sns
import os


os.chdir(rf'C:\Users\Darren\Desktop')
test = pd.read_csv('previous_org.csv')

sns.violinplot(y="Estab_Category", hue="Previous_Org", hue_order=["Yes",'No'],scale_hue = True,
                    data=test, palette="Set2", split=True)