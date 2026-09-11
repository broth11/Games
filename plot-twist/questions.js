window.PLOT_CASES = [
  {
    "id": "1.A.1-1",
    "lesson": "1.A.1",
    "title": "Who counts?",
    "context": "A school randomly surveys 80 of its 1,200 students about commute time.",
    "visual": {
      "type": "tiles",
      "items": [
        "Population: 1,200 students",
        "Sample: 80 students",
        "Sample mean: 18 min"
      ]
    },
    "questions": [
      {
        "prompt": "An observational unit is…",
        "choices": [
          "One student",
          "One minute",
          "The sample mean"
        ],
        "answer": 0,
        "explanation": "Each student contributes one observation."
      },
      {
        "prompt": "18 minutes is a…",
        "choices": [
          "Statistic",
          "Parameter",
          "Population"
        ],
        "answer": 0,
        "explanation": "It summarizes the sample. A population summary is a parameter."
      },
      {
        "prompt": "The population size N is…",
        "choices": [
          "1,200",
          "80",
          "18"
        ],
        "answer": 0,
        "explanation": "N counts all students of interest; n = 80 counts sampled students."
      }
    ]
  },
  {
    "id": "1.A.1-2",
    "lesson": "1.A.1",
    "title": "Numbers in disguise",
    "context": "A library records these variables for each borrower.",
    "visual": {
      "type": "table",
      "headers": [
        "Variable",
        "Example"
      ],
      "rows": [
        [
          "Card ID",
          "00482"
        ],
        [
          "Books borrowed",
          "3"
        ],
        [
          "Visit length",
          "12.6 min"
        ]
      ]
    },
    "questions": [
      {
        "prompt": "Card ID is…",
        "choices": [
          "Categorical",
          "Quantitative, discrete",
          "Quantitative, continuous"
        ],
        "answer": 0,
        "explanation": "Digits label a borrower; arithmetic on IDs has no quantitative meaning."
      },
      {
        "prompt": "Books borrowed is…",
        "choices": [
          "Quantitative, discrete",
          "Categorical",
          "Quantitative, continuous"
        ],
        "answer": 0,
        "explanation": "A count takes separate whole-number values."
      },
      {
        "prompt": "Visit length is…",
        "choices": [
          "Quantitative, continuous",
          "Quantitative, discrete",
          "Categorical"
        ],
        "answer": 0,
        "explanation": "Time is measured on a continuum, even if recorded to a fixed precision."
      }
    ]
  },
  {
    "id": "1.A.1-3",
    "lesson": "1.A.1",
    "title": "Ask a statistician",
    "context": "Students investigate daily screen time at their school.",
    "visual": {
      "type": "tiles",
      "items": [
        "Individuals vary",
        "Target: all students at this school",
        "Measure: daily screen time"
      ]
    },
    "questions": [
      {
        "prompt": "Which is a statistical question?",
        "choices": [
          "How does daily screen time vary among students?",
          "What is my student ID?",
          "How many minutes are in an hour?"
        ],
        "answer": 0,
        "explanation": "A statistical question anticipates variability in data."
      },
      {
        "prompt": "A mean for every student would be a…",
        "choices": [
          "Parameter",
          "Sample statistic",
          "Category"
        ],
        "answer": 0,
        "explanation": "A numerical summary of the entire target population is a parameter."
      },
      {
        "prompt": "Which record needs a unit?",
        "choices": [
          "Screen time: 145 minutes",
          "Grade level: 11",
          "Student ID: 041"
        ],
        "answer": 0,
        "explanation": "A quantitative measurement needs its context and units."
      }
    ]
  },
  {
    "id": "1.A.1-4",
    "lesson": "1.A.1",
    "title": "Sample ≠ population",
    "context": "Forty randomly selected students report sleep hours.",
    "visual": {
      "type": "tiles",
      "items": [
        "Target: all 900 students",
        "Observed: 40 students",
        "One value per student"
      ]
    },
    "questions": [
      {
        "prompt": "The sample is…",
        "choices": [
          "The 40 selected students",
          "All 900 students",
          "The 40 sleep-hour values"
        ],
        "answer": 0,
        "explanation": "A sample consists of selected observational units; their values are the data."
      },
      {
        "prompt": "The variable is…",
        "choices": [
          "Hours slept",
          "The 40 students",
          "The school"
        ],
        "answer": 0,
        "explanation": "The variable is the characteristic measured on each student."
      },
      {
        "prompt": "Why might another sample have a different mean?",
        "choices": [
          "Sampling variability",
          "The population must have changed",
          "Random selection guarantees equal means"
        ],
        "answer": 0,
        "explanation": "Different random samples generally produce different statistics."
      }
    ]
  },
  {
    "id": "1.A.2-1",
    "lesson": "1.A.2",
    "title": "Lunch vote",
    "context": "Each of 50 students chooses one lunch.",
    "visual": {
      "type": "image",
      "src": "graphics/lunch-vote.svg",
      "alt": "Bar and pie charts of lunch choices: noodles 25 (50%), rice 15 (30%), salad 10 (20%)."
    },
    "questions": [
      {
        "prompt": "Rice relative frequency?",
        "choices": [
          "30%",
          "15%",
          "60%"
        ],
        "answer": 0,
        "explanation": "15 / 50 = 0.30."
      },
      {
        "prompt": "A valid pie chart gives noodles…",
        "choices": [
          "Half the circle",
          "One quarter",
          "25 degrees"
        ],
        "answer": 0,
        "explanation": "25 / 50 = 50%, or 180 degrees."
      },
      {
        "prompt": "Best graph for comparing these counts?",
        "choices": [
          "Bar graph",
          "Histogram",
          "Boxplot"
        ],
        "answer": 0,
        "explanation": "Lunch is categorical. Bar heights show category frequencies."
      }
    ]
  },
  {
    "id": "1.A.2-2",
    "lesson": "1.A.2",
    "title": "Unequal crowds",
    "context": "Students choose whether to cycle to school.",
    "visual": {
      "type": "table",
      "headers": [
        "Group",
        "Cycle",
        "Total"
      ],
      "rows": [
        [
          "A",
          18,
          30
        ],
        [
          "B",
          24,
          60
        ]
      ]
    },
    "questions": [
      {
        "prompt": "Which group has the higher cycling proportion?",
        "choices": [
          "A",
          "B",
          "Equal"
        ],
        "answer": 0,
        "explanation": "A: 18/30 = 60%; B: 24/60 = 40%."
      },
      {
        "prompt": "Why not compare 18 with 24 alone?",
        "choices": [
          "The group sizes differ",
          "Counts are always invalid",
          "Proportions remove all bias"
        ],
        "answer": 0,
        "explanation": "Relative frequencies account for unequal group totals."
      },
      {
        "prompt": "Which claim fits?",
        "choices": [
          "Cycling is 20 percentage points higher in A",
          "Cycling is 20% of A",
          "A has more cyclists"
        ],
        "answer": 0,
        "explanation": "60% − 40% = 20 percentage points. B still has more cyclists in count."
      }
    ]
  },
  {
    "id": "1.A.2-3",
    "lesson": "1.A.2",
    "title": "Axis of deception",
    "context": "A poster compares approval rates of 51% and 54%.",
    "visual": {
      "type": "image",
      "src": "graphics/axis-of-deception.svg",
      "alt": "Approval bar chart: vertical axis 50% to 55%. Group A reaches 51%; group B reaches 54%. Bars begin at 50%."
    },
    "questions": [
      {
        "prompt": "Why do the bars exaggerate the gap?",
        "choices": [
          "The baseline is truncated",
          "The categories are unordered",
          "Percentages cannot be graphed"
        ],
        "answer": 0,
        "explanation": "Visible bar lengths become 1 and 4, exaggerating a 3-point difference."
      },
      {
        "prompt": "Best repair for these bars?",
        "choices": [
          "Start the percentage axis at 0",
          "Remove the axis labels",
          "Use unequal bar widths"
        ],
        "answer": 0,
        "explanation": "A zero baseline preserves meaningful comparisons of bar length."
      },
      {
        "prompt": "The actual difference is…",
        "choices": [
          "3 percentage points",
          "4 times as much approval",
          "54 percentage points"
        ],
        "answer": 0,
        "explanation": "54% − 51% = 3 percentage points."
      }
    ]
  },
  {
    "id": "1.A.2-4",
    "lesson": "1.A.2",
    "title": "Parts of a whole",
    "context": "A club records one preferred activity per member.",
    "visual": {
      "type": "image",
      "src": "graphics/parts-of-a-whole.svg",
      "alt": "Pie chart of preferred activities: Art 40%, Sport 35%, Music 25%."
    },
    "questions": [
      {
        "prompt": "These relative frequencies sum to…",
        "choices": [
          "1",
          "100 members",
          "0.75"
        ],
        "answer": 0,
        "explanation": "Mutually exclusive, exhaustive categories account for the whole group."
      },
      {
        "prompt": "If there are 80 members, how many prefer music?",
        "choices": [
          "20",
          "25",
          "32"
        ],
        "answer": 0,
        "explanation": "0.25 × 80 = 20 members."
      },
      {
        "prompt": "Could a pie chart show overlapping club memberships?",
        "choices": [
          "Not as mutually exclusive slices",
          "Yes, even if totals exceed 100%",
          "Only if slices have equal angles"
        ],
        "answer": 0,
        "explanation": "A pie partitions one whole. Overlapping categories do not form such a partition."
      }
    ]
  },
  {
    "id": "1.A.3-1",
    "lesson": "1.A.3",
    "title": "Stack attack",
    "context": "Books read last month by 12 students.",
    "visual": {
      "type": "dots",
      "values": [
        0,
        1,
        1,
        2,
        2,
        2,
        2,
        3,
        3,
        4,
        6,
        8
      ],
      "unit": "Books read"
    },
    "questions": [
      {
        "prompt": "The distribution is…",
        "choices": [
          "Right-skewed",
          "Left-skewed",
          "Symmetric"
        ],
        "answer": 0,
        "explanation": "Most values are small, with a longer tail toward 8 books."
      },
      {
        "prompt": "The most frequent value is…",
        "choices": [
          "2 books",
          "4 books",
          "8 books"
        ],
        "answer": 0,
        "explanation": "Four dots are stacked at 2."
      },
      {
        "prompt": "Which description stays in context?",
        "choices": [
          "Most students read 1–3 books; a few read many more",
          "Most books read 1–3 students",
          "The students are right-skewed"
        ],
        "answer": 0,
        "explanation": "Describe the distribution of books read, not the people as skewed."
      }
    ]
  },
  {
    "id": "1.A.3-2",
    "lesson": "1.A.3",
    "title": "Bin there",
    "context": "Commute times for 20 students; intervals include the left endpoint only.",
    "visual": {
      "type": "hist",
      "labels": [
        "0–<10",
        "10–<20",
        "20–<30",
        "30–<40"
      ],
      "counts": [
        3,
        9,
        6,
        2
      ],
      "unit": "Commute time (min)"
    },
    "questions": [
      {
        "prompt": "How many commute under 20 minutes?",
        "choices": [
          "12",
          "9",
          "15"
        ],
        "answer": 0,
        "explanation": "The first two bins contain 3 + 9 = 12 students."
      },
      {
        "prompt": "Can you recover the exact median?",
        "choices": [
          "No, only its bin",
          "Yes: 15 minutes",
          "Yes: 20 minutes"
        ],
        "answer": 0,
        "explanation": "The 10th and 11th observations lie in 10–<20, but exact values are hidden."
      },
      {
        "prompt": "Why do these bars touch?",
        "choices": [
          "They represent adjacent quantitative intervals",
          "The categories overlap",
          "All frequencies are equal"
        ],
        "answer": 0,
        "explanation": "Histogram bins cover adjacent intervals of a quantitative scale."
      }
    ]
  },
  {
    "id": "1.A.3-3",
    "lesson": "1.A.3",
    "title": "Stem the tide",
    "context": "Quiz scores, out of 50.",
    "visual": {
      "type": "table",
      "headers": [
        "Stem",
        "Leaves"
      ],
      "rows": [
        [
          "2",
          "4 8"
        ],
        [
          "3",
          "1 1 6"
        ],
        [
          "4",
          "0 5"
        ],
        [
          "Key",
          "3 | 1 = 31 points"
        ]
      ]
    },
    "questions": [
      {
        "prompt": "The largest score is…",
        "choices": [
          "45",
          "5",
          "40"
        ],
        "answer": 0,
        "explanation": "The key converts 4 | 5 to 45 points."
      },
      {
        "prompt": "The median score is…",
        "choices": [
          "31",
          "36",
          "34"
        ],
        "answer": 0,
        "explanation": "The seven ordered scores are 24, 28, 31, 31, 36, 40, 45; the fourth is 31."
      },
      {
        "prompt": "What does this preserve that a histogram usually loses?",
        "choices": [
          "Individual recorded values",
          "Only relative frequencies",
          "The identities of students"
        ],
        "answer": 0,
        "explanation": "Stem-and-leaf plots retain individual values, not student identities."
      }
    ]
  },
  {
    "id": "1.A.3-4",
    "lesson": "1.A.3",
    "title": "Two peaks, one story",
    "context": "Travel times mix walkers and bus riders.",
    "visual": {
      "type": "dots",
      "values": [
        5,
        5,
        6,
        6,
        7,
        7,
        20,
        20,
        21,
        21,
        22,
        22
      ],
      "unit": "Travel time (min)"
    },
    "questions": [
      {
        "prompt": "The shape is…",
        "choices": [
          "Bimodal",
          "Uniform",
          "Single-peaked"
        ],
        "answer": 0,
        "explanation": "There are two distinct clusters/peaks."
      },
      {
        "prompt": "An unusual feature is…",
        "choices": [
          "A gap between 7 and 20 minutes",
          "A negative travel time",
          "Every value is an outlier"
        ],
        "answer": 0,
        "explanation": "No observations appear between the two groups."
      },
      {
        "prompt": "A nearly equal count in every interval would look…",
        "choices": [
          "Uniform",
          "Bimodal",
          "Strongly skewed"
        ],
        "answer": 0,
        "explanation": "A uniform distribution has roughly constant frequency across its range."
      }
    ]
  },
  {
    "id": "1.A.4-1",
    "lesson": "1.A.4",
    "title": "Middle management",
    "context": "Five queue times at a café.",
    "visual": {
      "type": "tiles",
      "items": [
        "2, 3, 3, 5, 12 minutes"
      ]
    },
    "questions": [
      {
        "prompt": "Mean queue time?",
        "choices": [
          "5 minutes",
          "3 minutes",
          "7 minutes"
        ],
        "answer": 0,
        "explanation": "(2 + 3 + 3 + 5 + 12) / 5 = 5 minutes."
      },
      {
        "prompt": "Median queue time?",
        "choices": [
          "3 minutes",
          "5 minutes",
          "12 minutes"
        ],
        "answer": 0,
        "explanation": "The third of five ordered observations is 3."
      },
      {
        "prompt": "Range?",
        "choices": [
          "10 minutes",
          "12 minutes",
          "7 minutes"
        ],
        "answer": 0,
        "explanation": "Maximum − minimum = 12 − 2 = 10 minutes."
      }
    ]
  },
  {
    "id": "1.A.4-2",
    "lesson": "1.A.4",
    "title": "Spread the word",
    "context": "Two routes have the same mean travel time.",
    "visual": {
      "type": "twodots",
      "a": [
        8,
        9,
        10,
        11,
        12
      ],
      "b": [
        2,
        6,
        10,
        14,
        18
      ],
      "unit": "Travel time (min)"
    },
    "questions": [
      {
        "prompt": "Which route has larger standard deviation?",
        "choices": [
          "B",
          "A",
          "Equal"
        ],
        "answer": 0,
        "explanation": "B’s times lie farther from the common mean of 10 minutes."
      },
      {
        "prompt": "What does SD describe here?",
        "choices": [
          "Typical distance of times from their mean",
          "The distance between the largest two times",
          "The percentage below the mean"
        ],
        "answer": 0,
        "explanation": "Standard deviation measures spread around the mean, in minutes."
      },
      {
        "prompt": "Variance has units of…",
        "choices": [
          "Minutes squared",
          "Minutes",
          "No units"
        ],
        "answer": 0,
        "explanation": "Variance is the square of standard deviation."
      }
    ]
  },
  {
    "id": "1.A.4-3",
    "lesson": "1.A.4",
    "title": "Quarter turns",
    "context": "Eight ordered practice times; use medians of the lower and upper halves.",
    "visual": {
      "type": "tiles",
      "items": [
        "2, 4, 6, 8, 10, 12, 14, 16 minutes"
      ]
    },
    "questions": [
      {
        "prompt": "Q1 is…",
        "choices": [
          "5 minutes",
          "4 minutes",
          "6 minutes"
        ],
        "answer": 0,
        "explanation": "The lower half is 2, 4, 6, 8; its median is (4 + 6)/2 = 5."
      },
      {
        "prompt": "IQR is…",
        "choices": [
          "8 minutes",
          "14 minutes",
          "9 minutes"
        ],
        "answer": 0,
        "explanation": "Q3 = 13; IQR = 13 − 5 = 8 minutes."
      },
      {
        "prompt": "IQR describes…",
        "choices": [
          "The spread of the middle 50%",
          "The mean distance from the mean",
          "The full range"
        ],
        "answer": 0,
        "explanation": "The interval from Q1 to Q3 contains the middle half of the distribution."
      }
    ]
  },
  {
    "id": "1.A.4-4",
    "lesson": "1.A.4",
    "title": "Percentile plot twist",
    "context": "A 42-minute wait is at the 80th percentile. Use the at-or-below convention.",
    "visual": {
      "type": "tiles",
      "items": [
        "Wait: 42 minutes",
        "Percentile: 80"
      ]
    },
    "questions": [
      {
        "prompt": "Interpret the 80th percentile.",
        "choices": [
          "About 80% of waits are at or below 42 min",
          "80% of waits equal 42 min",
          "42% of waits are below 80 min"
        ],
        "answer": 0,
        "explanation": "A percentile describes relative position, not a percent of the measurement."
      },
      {
        "prompt": "For a sample, SD divides squared deviations by…",
        "choices": [
          "n − 1",
          "n",
          "The mean"
        ],
        "answer": 0,
        "explanation": "The sample variance uses n − 1, followed by a square root for s."
      },
      {
        "prompt": "For 2, 4, 6 minutes, sample SD is…",
        "choices": [
          "2 minutes",
          "4 minutes",
          "1.63 minutes"
        ],
        "answer": 0,
        "explanation": "Mean = 4; squared deviations sum to 8. s = √(8/2) = 2 minutes."
      }
    ]
  },
  {
    "id": "1.A.5-1",
    "lesson": "1.A.5",
    "title": "Outside the box",
    "context": "Delivery times; the boxplot shows non-outlier whiskers.",
    "visual": {
      "type": "box",
      "min": 10,
      "q1": 14,
      "median": 18,
      "q3": 22,
      "max": 30,
      "outliers": [
        40
      ],
      "unit": "Delivery time (min)"
    },
    "questions": [
      {
        "prompt": "The IQR is…",
        "choices": [
          "8 minutes",
          "20 minutes",
          "30 minutes"
        ],
        "answer": 0,
        "explanation": "22 − 14 = 8 minutes."
      },
      {
        "prompt": "The upper 1.5 × IQR fence is…",
        "choices": [
          "34 minutes",
          "30 minutes",
          "40 minutes"
        ],
        "answer": 0,
        "explanation": "22 + 1.5(8) = 34 minutes."
      },
      {
        "prompt": "Why is 40 plotted separately?",
        "choices": [
          "It exceeds the upper fence",
          "It exceeds the median",
          "The whisker must end at Q3"
        ],
        "answer": 0,
        "explanation": "40 > 34, so it is flagged by the 1.5 × IQR rule."
      }
    ]
  },
  {
    "id": "1.A.5-2",
    "lesson": "1.A.5",
    "title": "Change the scale",
    "context": "A sensor has mean 10°C, median 9°C, SD 2°C, and IQR 3°C.",
    "visual": {
      "type": "tiles",
      "items": [
        "New reading Y = 2X + 5"
      ]
    },
    "questions": [
      {
        "prompt": "The new mean is…",
        "choices": [
          "25",
          "20",
          "15"
        ],
        "answer": 0,
        "explanation": "Location measures follow 2(10) + 5 = 25."
      },
      {
        "prompt": "The new SD is…",
        "choices": [
          "4",
          "9",
          "8"
        ],
        "answer": 0,
        "explanation": "Adding 5 does not change spread; multiplying by 2 doubles SD."
      },
      {
        "prompt": "The new variance is…",
        "choices": [
          "16",
          "8",
          "4"
        ],
        "answer": 0,
        "explanation": "Original variance = 2² = 4; multiplying readings by 2 multiplies variance by 4."
      }
    ]
  },
  {
    "id": "1.A.5-3",
    "lesson": "1.A.5",
    "title": "Resist the twist",
    "context": "Replace the largest value, 8, with 80.",
    "visual": {
      "type": "tiles",
      "items": [
        "Before: 2, 3, 4, 5, 8",
        "After: 2, 3, 4, 5, 80"
      ]
    },
    "questions": [
      {
        "prompt": "Which stays unchanged here?",
        "choices": [
          "Median",
          "Mean",
          "Range"
        ],
        "answer": 0,
        "explanation": "The middle ordered value is still 4."
      },
      {
        "prompt": "For strongly skewed data, usually summarize with…",
        "choices": [
          "Median and IQR",
          "Mean and SD only",
          "Range alone"
        ],
        "answer": 0,
        "explanation": "Median and IQR resist extreme observations better than mean and SD."
      },
      {
        "prompt": "Resistant means…",
        "choices": [
          "Not greatly affected by a few extreme values",
          "Never changes when data change",
          "Always equals the mean"
        ],
        "answer": 0,
        "explanation": "Resistance is limited sensitivity, not complete immunity."
      }
    ]
  },
  {
    "id": "1.A.5-4",
    "lesson": "1.A.5",
    "title": "Two rules",
    "context": "A dataset has mean 50, SD 5, Q1 45, Q3 55. Consider x = 62.",
    "visual": {
      "type": "image",
      "src": "graphics/two-rules.svg",
      "alt": "Common-scale number lines: mean plus or minus two SD spans 40–60; IQR fences span 30–70. A dashed line marks the observation 62."
    },
    "questions": [
      {
        "prompt": "Flagged by the more-than-2-SD rule?",
        "choices": [
          "Yes",
          "No",
          "Only if it is below the mean"
        ],
        "answer": 0,
        "explanation": "62 is more than two SD above 50."
      },
      {
        "prompt": "Flagged by the 1.5 × IQR rule?",
        "choices": [
          "No",
          "Yes",
          "Every point above Q3 is flagged"
        ],
        "answer": 0,
        "explanation": "62 lies inside the fences 30 and 70."
      },
      {
        "prompt": "What should you conclude?",
        "choices": [
          "State the rule; investigate the value",
          "Delete 62 automatically",
          "Both rules must agree"
        ],
        "answer": 0,
        "explanation": "Outlier flags depend on the criterion; they are reasons to investigate, not automatic deletion."
      }
    ]
  },
  {
    "id": "1.A.6-1",
    "lesson": "1.A.6",
    "title": "Above average",
    "context": "Exam A: mean 70, SD 10. Noor scores 85.",
    "visual": {
      "type": "tiles",
      "items": [
        "z = (value − mean) / SD",
        "(85 − 70) / 10"
      ]
    },
    "questions": [
      {
        "prompt": "Noor’s z-score is…",
        "choices": [
          "1.5",
          "15",
          "−1.5"
        ],
        "answer": 0,
        "explanation": "z = 15 / 10 = 1.5."
      },
      {
        "prompt": "Interpret it.",
        "choices": [
          "85 is 1.5 SD above the mean",
          "85 is 1.5 points above the mean",
          "85 is the 95th percentile"
        ],
        "answer": 0,
        "explanation": "A z-score measures distance from the mean in standard deviations."
      },
      {
        "prompt": "Can z alone give an exact percentile?",
        "choices": [
          "No; distribution information is needed",
          "Yes, always",
          "Yes, if z is positive"
        ],
        "answer": 0,
        "explanation": "A relative SD position does not identify the proportion below without more information."
      }
    ]
  },
  {
    "id": "1.A.6-2",
    "lesson": "1.A.6",
    "title": "Same score, new league",
    "context": "Kai scores 80 on two different tests.",
    "visual": {
      "type": "table",
      "headers": [
        "Test",
        "Mean",
        "SD"
      ],
      "rows": [
        [
          "A",
          70,
          5
        ],
        [
          "B",
          60,
          20
        ]
      ]
    },
    "questions": [
      {
        "prompt": "Kai’s z-score on A?",
        "choices": [
          "2",
          "1",
          "4"
        ],
        "answer": 0,
        "explanation": "(80 − 70)/5 = 2."
      },
      {
        "prompt": "Stronger standing in SD units?",
        "choices": [
          "A",
          "B",
          "Equal"
        ],
        "answer": 0,
        "explanation": "A: z = 2; B: z = 1. A is farther above its mean in SD units."
      },
      {
        "prompt": "A z-score has…",
        "choices": [
          "No measurement units",
          "Points",
          "Points squared"
        ],
        "answer": 0,
        "explanation": "The numerator and denominator have matching units, which cancel."
      }
    ]
  },
  {
    "id": "1.A.6-3",
    "lesson": "1.A.6",
    "title": "Compare fairly",
    "context": "Commute times for two schools.",
    "visual": {
      "type": "twobox",
      "a": [
        5,
        10,
        15,
        20,
        30
      ],
      "b": [
        10,
        20,
        25,
        35,
        50
      ],
      "unit": "Commute time (min)"
    },
    "questions": [
      {
        "prompt": "Which school has the higher median?",
        "choices": [
          "B",
          "A",
          "Equal"
        ],
        "answer": 0,
        "explanation": "B’s median is 25 minutes; A’s is 15 minutes."
      },
      {
        "prompt": "Which has greater IQR?",
        "choices": [
          "B",
          "A",
          "Equal"
        ],
        "answer": 0,
        "explanation": "B: 35 − 20 = 15; A: 20 − 10 = 10 minutes."
      },
      {
        "prompt": "A complete comparison should include…",
        "choices": [
          "Center, spread, shape and unusual features in context",
          "Only which median is bigger",
          "Only the sample sizes"
        ],
        "answer": 0,
        "explanation": "Compare distributions using context and evidence; avoid unsupported details hidden by boxplots."
      }
    ]
  },
  {
    "id": "1.A.6-4",
    "lesson": "1.A.6",
    "title": "Lower can be better",
    "context": "Sprint times: mean 15 seconds, SD 2 seconds. Lee runs 12 seconds.",
    "visual": {
      "type": "tiles",
      "items": [
        "Lower time = faster",
        "Lee: 12 s",
        "Mean: 15 s · SD: 2 s"
      ]
    },
    "questions": [
      {
        "prompt": "Lee’s z-score is…",
        "choices": [
          "−1.5",
          "1.5",
          "−3"
        ],
        "answer": 0,
        "explanation": "(12 − 15)/2 = −1.5."
      },
      {
        "prompt": "Interpret it.",
        "choices": [
          "1.5 SD below the mean time",
          "1.5 seconds below the mean time",
          "Slower than average"
        ],
        "answer": 0,
        "explanation": "Below the mean time means faster in this context."
      },
      {
        "prompt": "Must a higher z mean better performance?",
        "choices": [
          "No; the variable and goal matter",
          "Yes, always",
          "Only if the data are symmetric"
        ],
        "answer": 0,
        "explanation": "For race time, smaller values are better; the sign is not a quality rating."
      }
    ]
  },
  {
    "id": "1.B.1-1",
    "lesson": "1.B.1",
    "title": "Watch or change?",
    "context": "Researchers record students’ usual breakfast and later quiz scores.",
    "visual": {
      "type": "tiles",
      "items": [
        "No breakfast assigned",
        "Breakfast → possible predictor",
        "Quiz score → outcome"
      ]
    },
    "questions": [
      {
        "prompt": "Study type?",
        "choices": [
          "Observational",
          "Experiment",
          "Census by definition"
        ],
        "answer": 0,
        "explanation": "Researchers observe an existing behavior rather than impose a treatment."
      },
      {
        "prompt": "Response variable?",
        "choices": [
          "Quiz score",
          "Breakfast choice",
          "Researcher name"
        ],
        "answer": 0,
        "explanation": "The response is the outcome the study seeks to explain."
      },
      {
        "prompt": "Can an association alone establish breakfast causes higher scores?",
        "choices": [
          "No; sleep could confound it",
          "Yes; breakfast comes first",
          "Yes; if the sample is large"
        ],
        "answer": 0,
        "explanation": "Sleep might affect both breakfast habits and scores, providing an alternative explanation."
      }
    ]
  },
  {
    "id": "1.B.1-2",
    "lesson": "1.B.1",
    "title": "Forward or backward?",
    "context": "Two studies investigate exercise and injury.",
    "visual": {
      "type": "table",
      "headers": [
        "Study",
        "Method"
      ],
      "rows": [
        [
          "A",
          "Record exercise now; follow injuries next year"
        ],
        [
          "B",
          "Review past exercise and injury records"
        ]
      ]
    },
    "questions": [
      {
        "prompt": "Study A is…",
        "choices": [
          "Prospective observational",
          "Retrospective observational",
          "Randomized experiment"
        ],
        "answer": 0,
        "explanation": "It observes people forward in time without assigning exercise."
      },
      {
        "prompt": "Study B is…",
        "choices": [
          "Retrospective observational",
          "Prospective experiment",
          "Randomized experiment"
        ],
        "answer": 0,
        "explanation": "It looks backward using records of past events."
      },
      {
        "prompt": "A useful investigative question names…",
        "choices": [
          "Population, variables and their relationship",
          "Only a yes/no prediction",
          "Only the sample size"
        ],
        "answer": 0,
        "explanation": "For example: among school athletes, how is exercise time associated with injury occurrence?"
      }
    ]
  },
  {
    "id": "1.B.1-3",
    "lesson": "1.B.1",
    "title": "Random digits, real sample",
    "context": "Select 3 of 80 students labeled 01–80, without replacement.",
    "visual": {
      "type": "tiles",
      "items": [
        "Read two-digit groups",
        "04 · 83 · 04 · 17 · 00 · 62"
      ]
    },
    "questions": [
      {
        "prompt": "The selected labels are…",
        "choices": [
          "04, 17, 62",
          "04, 83, 04",
          "04, 17, 00"
        ],
        "answer": 0,
        "explanation": "Skip 83 and 00 as invalid labels; skip the repeated 04."
      },
      {
        "prompt": "For an SRS of size 3…",
        "choices": [
          "Every group of 3 has the same selection chance",
          "Only individuals need equal chances",
          "Take the first 3 volunteers"
        ],
        "answer": 0,
        "explanation": "Equal individual chances alone do not make every possible size-3 sample equally likely."
      },
      {
        "prompt": "Selecting all 80 would be a…",
        "choices": [
          "Census",
          "Cluster sample",
          "Sample of size 3"
        ],
        "answer": 0,
        "explanation": "A census attempts to collect data from every member of the population."
      }
    ]
  },
  {
    "id": "1.B.1-4",
    "lesson": "1.B.1",
    "title": "Two routes to data",
    "context": "A transit team counts passengers at a stop and asks riders about satisfaction.",
    "visual": {
      "type": "tiles",
      "items": [
        "Count passengers → observation",
        "Ask satisfaction → survey"
      ]
    },
    "questions": [
      {
        "prompt": "The satisfaction data come from…",
        "choices": [
          "A survey",
          "An imposed experiment",
          "Random assignment"
        ],
        "answer": 0,
        "explanation": "Asking people to report information is a survey method."
      },
      {
        "prompt": "Counting passengers is…",
        "choices": [
          "Direct observation",
          "A treatment",
          "A placebo"
        ],
        "answer": 0,
        "explanation": "The team records behavior directly rather than asking riders to recall it."
      },
      {
        "prompt": "Which question matches the survey?",
        "choices": [
          "How satisfied are riders using this stop?",
          "Does assigning a new bus cause satisfaction to rise?",
          "What is every city resident’s opinion?"
        ],
        "answer": 0,
        "explanation": "The measured variable and target group must match the question; no bus treatment was assigned."
      }
    ]
  },
  {
    "id": "1.B.2-1",
    "lesson": "1.B.2",
    "title": "Strata strategy",
    "context": "A school has 600 younger and 400 older students. Randomly sample within both groups.",
    "visual": {
      "type": "tiles",
      "items": [
        "Younger → random 60",
        "Older → random 40",
        "Combine → 100"
      ]
    },
    "questions": [
      {
        "prompt": "Sampling method?",
        "choices": [
          "Stratified random",
          "Cluster",
          "Convenience"
        ],
        "answer": 0,
        "explanation": "Both strata contribute a random sample."
      },
      {
        "prompt": "Why group by age for a sleep survey?",
        "choices": [
          "Sleep may differ by age",
          "It guarantees no response bias",
          "It makes all samples identical"
        ],
        "answer": 0,
        "explanation": "Stratification can improve precision when the variable differs across strata and varies less within them."
      },
      {
        "prompt": "How does this differ from cluster sampling?",
        "choices": [
          "Sample some individuals from every stratum",
          "Survey everyone in selected strata only",
          "Only sample one age group"
        ],
        "answer": 0,
        "explanation": "Cluster sampling selects clusters, then often surveys every individual in the chosen clusters."
      }
    ]
  },
  {
    "id": "1.B.2-2",
    "lesson": "1.B.2",
    "title": "Block party",
    "context": "A city randomly chooses 4 of 40 blocks and surveys every household on those blocks.",
    "visual": {
      "type": "tiles",
      "items": [
        "40 blocks → random 4 blocks → every household there"
      ]
    },
    "questions": [
      {
        "prompt": "Sampling method?",
        "choices": [
          "Cluster",
          "Stratified",
          "Simple random sample of households"
        ],
        "answer": 0,
        "explanation": "Blocks, rather than individual households, are randomly selected."
      },
      {
        "prompt": "A practical advantage?",
        "choices": [
          "Less travel between households",
          "Guaranteed smaller variability",
          "No need for random selection"
        ],
        "answer": 0,
        "explanation": "Geographic clusters can reduce collection costs."
      },
      {
        "prompt": "If blocks differ greatly in income, an income estimate may have…",
        "choices": [
          "High sample-to-sample variability",
          "No sampling variability",
          "Guaranteed downward bias"
        ],
        "answer": 0,
        "explanation": "Selecting only a few very different blocks can make estimates vary considerably; this is not necessarily systematic bias."
      }
    ]
  },
  {
    "id": "1.B.2-3",
    "lesson": "1.B.2",
    "title": "Every tenth",
    "context": "From an ordered list of 500, randomly choose a start from 1–10, then take every tenth.",
    "visual": {
      "type": "tiles",
      "items": [
        "Random start: 7",
        "Selected: 7, 17, 27, …, 497"
      ]
    },
    "questions": [
      {
        "prompt": "Sampling method?",
        "choices": [
          "Systematic",
          "Convenience",
          "Stratified"
        ],
        "answer": 0,
        "explanation": "Systematic sampling uses a random start and regular interval."
      },
      {
        "prompt": "Sample size?",
        "choices": [
          "50",
          "10",
          "49"
        ],
        "answer": 0,
        "explanation": "There are 50 selected positions: 7 + 10k for k = 0,…,49."
      },
      {
        "prompt": "What ordering could cause trouble?",
        "choices": [
          "A repeating pattern every 10 entries",
          "Any alphabetical list automatically",
          "A random ordering automatically"
        ],
        "answer": 0,
        "explanation": "Periodicity matching the selection interval can make the sample unrepresentative."
      }
    ]
  },
  {
    "id": "1.B.2-4",
    "lesson": "1.B.2",
    "title": "Aim and scatter",
    "context": "Repeated sample estimates of a population value of 50.",
    "visual": {
      "type": "image",
      "src": "graphics/aim-and-scatter.svg",
      "alt": "Three dotplots on the same 30–70 axis. Target 50. A estimates: 49, 50, 51. B: 35, 50, 65. C: 59, 60, 61."
    },
    "questions": [
      {
        "prompt": "Which is tightly grouped but off target?",
        "choices": [
          "C",
          "A",
          "B"
        ],
        "answer": 0,
        "explanation": "C has low observed variability but is centered well above 50."
      },
      {
        "prompt": "Which is centered at 50 but most variable?",
        "choices": [
          "B",
          "C",
          "A"
        ],
        "answer": 0,
        "explanation": "B has the largest spread while its center is on target."
      },
      {
        "prompt": "Larger random samples generally reduce…",
        "choices": [
          "Sampling variability",
          "All forms of bias",
          "The population size"
        ],
        "answer": 0,
        "explanation": "Increasing n improves precision but does not repair a biased collection method."
      }
    ]
  },
  {
    "id": "1.B.3-1",
    "lesson": "1.B.3",
    "title": "Missing voices",
    "context": "A school surveys only students who ride its buses about all students’ commute times.",
    "visual": {
      "type": "tiles",
      "items": [
        "Target: ALL students",
        "Included: BUS riders",
        "Missing: walkers, cyclists, car riders"
      ]
    },
    "questions": [
      {
        "prompt": "Main problem?",
        "choices": [
          "Undercoverage",
          "Random assignment",
          "Placebo effect"
        ],
        "answer": 0,
        "explanation": "The sampling frame excludes parts of the target population."
      },
      {
        "prompt": "Can you infer the bias direction from this alone?",
        "choices": [
          "No; compare commute times of missing groups",
          "Always upward",
          "Always downward"
        ],
        "answer": 0,
        "explanation": "Direction depends on how excluded students’ commute times differ."
      },
      {
        "prompt": "Best repair?",
        "choices": [
          "Sample from the full student roster",
          "Survey more bus riders only",
          "Use a longer questionnaire"
        ],
        "answer": 0,
        "explanation": "A sampling frame covering the population addresses the identified exclusion."
      }
    ]
  },
  {
    "id": "1.B.3-2",
    "lesson": "1.B.3",
    "title": "Who answers?",
    "context": "A random sample receives a survey, but most selected people do not reply.",
    "visual": {
      "type": "tiles",
      "items": [
        "Randomly selected: 200",
        "Replies: 40",
        "No replies: 160"
      ]
    },
    "questions": [
      {
        "prompt": "Main concern?",
        "choices": [
          "Nonresponse bias",
          "Voluntary-response sampling design",
          "Cluster sampling"
        ],
        "answer": 0,
        "explanation": "Selected individuals fail to respond; their answers may differ from respondents’ answers."
      },
      {
        "prompt": "An open website poll instead is…",
        "choices": [
          "Voluntary-response sampling",
          "An SRS",
          "A census"
        ],
        "answer": 0,
        "explanation": "Visitors choose themselves into an open poll rather than being randomly selected first."
      },
      {
        "prompt": "If unhappy customers reply more often, reported satisfaction is likely…",
        "choices": [
          "Too low",
          "Too high",
          "Exactly correct"
        ],
        "answer": 0,
        "explanation": "Overrepresentation of dissatisfied customers pushes estimated satisfaction downward."
      }
    ]
  },
  {
    "id": "1.B.3-3",
    "lesson": "1.B.3",
    "title": "Loaded question",
    "context": "“Don’t you agree our excellent new timetable is better?”",
    "visual": {
      "type": "tiles",
      "items": [
        "Leading wording",
        "Respondent sees the praise"
      ]
    },
    "questions": [
      {
        "prompt": "Main concern?",
        "choices": [
          "Response bias from wording",
          "Undercoverage only",
          "Sampling variability only"
        ],
        "answer": 0,
        "explanation": "The wording nudges respondents toward agreement."
      },
      {
        "prompt": "A neutral replacement?",
        "choices": [
          "How do you rate the new timetable?",
          "Why is the new timetable excellent?",
          "You prefer the new timetable, right?"
        ],
        "answer": 0,
        "explanation": "Neutral wording avoids signaling a preferred response."
      },
      {
        "prompt": "Would random sampling alone fix the wording problem?",
        "choices": [
          "No",
          "Yes",
          "Only with 1,000 people"
        ],
        "answer": 0,
        "explanation": "Random selection addresses who is sampled, not how a question influences answers."
      }
    ]
  },
  {
    "id": "1.B.3-4",
    "lesson": "1.B.3",
    "title": "Easy to reach",
    "context": "A researcher asks the nearest 30 gym users about weekly exercise.",
    "visual": {
      "type": "tiles",
      "items": [
        "Target: all town adults",
        "Sample: nearest gym users"
      ]
    },
    "questions": [
      {
        "prompt": "Sampling method?",
        "choices": [
          "Convenience",
          "Simple random",
          "Systematic with random start"
        ],
        "answer": 0,
        "explanation": "Participants are selected because they are easy to reach."
      },
      {
        "prompt": "Estimated exercise time is plausibly…",
        "choices": [
          "Too high",
          "Too low",
          "Necessarily unbiased"
        ],
        "answer": 0,
        "explanation": "Gym users may exercise more than adults generally; the direction relies on this contextual assumption."
      },
      {
        "prompt": "Exaggerating exercise to look healthy is…",
        "choices": [
          "Self-report / social-desirability response bias",
          "Random sampling",
          "Replication"
        ],
        "answer": 0,
        "explanation": "Respondents may misreport behavior they believe is socially preferred."
      }
    ]
  },
  {
    "id": "1.B.4-1",
    "lesson": "1.B.4",
    "title": "Treatment terms",
    "context": "80 seedlings are randomly assigned combinations of 2 fertilizers and 2 light levels.",
    "visual": {
      "type": "tiles",
      "items": [
        "Fertilizer: A or B",
        "Light: low or high",
        "Response: height after 4 weeks"
      ]
    },
    "questions": [
      {
        "prompt": "Experimental units?",
        "choices": [
          "Seedlings",
          "Fertilizers",
          "Height measurements"
        ],
        "answer": 0,
        "explanation": "A treatment combination is assigned to each seedling."
      },
      {
        "prompt": "Number of factors and treatments?",
        "choices": [
          "2 factors; 4 treatments",
          "4 factors; 2 treatments",
          "2 factors; 2 treatments"
        ],
        "answer": 0,
        "explanation": "Two factors with two levels each create 2 × 2 treatment combinations."
      },
      {
        "prompt": "A response variable is…",
        "choices": [
          "Height after 4 weeks",
          "Assigned light level",
          "Assigned fertilizer"
        ],
        "answer": 0,
        "explanation": "Height is the measured outcome; light and fertilizer are manipulated factors."
      }
    ]
  },
  {
    "id": "1.B.4-2",
    "lesson": "1.B.4",
    "title": "Design essentials",
    "context": "60 volunteers test a study app. Randomly assign 30 to each version; use the same quiz.",
    "visual": {
      "type": "tiles",
      "items": [
        "60 volunteers → RANDOM → A: 30 / B: 30",
        "Same quiz and study duration"
      ]
    },
    "questions": [
      {
        "prompt": "Why random assignment?",
        "choices": [
          "Balance other variables across groups on average",
          "Guarantee identical groups",
          "Make volunteers a random population sample"
        ],
        "answer": 0,
        "explanation": "Random assignment reduces systematic confounding; chance imbalances can remain."
      },
      {
        "prompt": "What provides replication?",
        "choices": [
          "Many students in each treatment",
          "One student measured many times only",
          "Using one app version"
        ],
        "answer": 0,
        "explanation": "Replication uses multiple experimental units per treatment to assess variability."
      },
      {
        "prompt": "Why keep study duration the same?",
        "choices": [
          "Directly control a possible extraneous variable",
          "Create a new treatment factor",
          "Guarantee a significant difference"
        ],
        "answer": 0,
        "explanation": "Holding duration constant helps isolate the effect of app version."
      }
    ]
  },
  {
    "id": "1.B.4-3",
    "lesson": "1.B.4",
    "title": "Blind ambition",
    "context": "A new tablet is compared with an identical-looking inert tablet. Participants and outcome assessors do not know assignments.",
    "visual": {
      "type": "tiles",
      "items": [
        "Treatment: active tablet",
        "Control: inert look-alike",
        "Assignment concealed from participants + assessors"
      ]
    },
    "questions": [
      {
        "prompt": "The inert tablet is a…",
        "choices": [
          "Placebo",
          "Block",
          "Response variable"
        ],
        "answer": 0,
        "explanation": "A placebo mimics treatment without its active ingredient."
      },
      {
        "prompt": "This setup is…",
        "choices": [
          "Double-blind",
          "Unblinded",
          "Single-blind only"
        ],
        "answer": 0,
        "explanation": "Both participants and those assessing outcomes are unaware of treatment assignment."
      },
      {
        "prompt": "Why use a placebo group?",
        "choices": [
          "Separate active effects from expectations and treatment experience",
          "Ensure nobody improves",
          "Eliminate all confounding automatically"
        ],
        "answer": 0,
        "explanation": "Expectations can affect responses; comparison with a placebo helps account for them."
      }
    ]
  },
  {
    "id": "1.B.4-4",
    "lesson": "1.B.4",
    "title": "Confounded café",
    "context": "All morning customers get music A; all evening customers get music B. Compare spending.",
    "visual": {
      "type": "tiles",
      "items": [
        "Morning = A",
        "Evening = B",
        "Response = spending"
      ]
    },
    "questions": [
      {
        "prompt": "What is confounded with music?",
        "choices": [
          "Time of day",
          "The dollar unit",
          "The number of songs alone"
        ],
        "answer": 0,
        "explanation": "Music and time change together, so their effects cannot be separated."
      },
      {
        "prompt": "Better design?",
        "choices": [
          "Randomly assign comparable sessions to A or B",
          "Keep every morning on A",
          "Compare only the biggest spenders"
        ],
        "answer": 0,
        "explanation": "Random assignment across comparable sessions avoids systematically pairing music with time."
      },
      {
        "prompt": "Single blinding means…",
        "choices": [
          "One relevant group is unaware of assignment",
          "Exactly one participant is unaware",
          "Everyone knows the treatment"
        ],
        "answer": 0,
        "explanation": "For example, participants may be unaware while administrators know. State who is blinded."
      }
    ]
  },
  {
    "id": "1.B.5-1",
    "lesson": "1.B.5",
    "title": "Block and roll",
    "context": "Test two training plans. Group athletes by initial skill, then randomize within each skill group.",
    "visual": {
      "type": "tiles",
      "items": [
        "Beginner → random A / B",
        "Experienced → random A / B"
      ]
    },
    "questions": [
      {
        "prompt": "Design?",
        "choices": [
          "Randomized block",
          "Completely randomized without blocks",
          "Cluster sample"
        ],
        "answer": 0,
        "explanation": "Units are grouped before treatment randomization within each block."
      },
      {
        "prompt": "Why block on initial skill?",
        "choices": [
          "Skill may explain variation in performance",
          "Skill is the response after training",
          "Blocking replaces random assignment"
        ],
        "answer": 0,
        "explanation": "Accounting for an associated variable can reduce unexplained variability in comparisons."
      },
      {
        "prompt": "What must still happen within each block?",
        "choices": [
          "Random assignment to plans",
          "Everyone gets the same plan",
          "Choose each athlete’s preferred plan"
        ],
        "answer": 0,
        "explanation": "Blocking alone does not randomize treatment or remove all confounding."
      }
    ]
  },
  {
    "id": "1.B.5-2",
    "lesson": "1.B.5",
    "title": "A pair of possibilities",
    "context": "Each student types the same-length task on two keyboards. Randomize which keyboard comes first.",
    "visual": {
      "type": "tiles",
      "items": [
        "Student 1: A → B",
        "Student 2: B → A",
        "Compare each student’s two times"
      ]
    },
    "questions": [
      {
        "prompt": "Design?",
        "choices": [
          "Matched pairs",
          "Independent cluster sample",
          "Observational only"
        ],
        "answer": 0,
        "explanation": "Each student receives both treatments and serves as their own comparison."
      },
      {
        "prompt": "Why randomize order?",
        "choices": [
          "Reduce systematic practice or fatigue effects",
          "Guarantee no fatigue",
          "Make the students a random sample"
        ],
        "answer": 0,
        "explanation": "Random order prevents one keyboard always benefiting from practice or suffering fatigue."
      },
      {
        "prompt": "Another matched-pairs design uses…",
        "choices": [
          "Similar students paired, then A/B randomized within pairs",
          "Any two large unrelated groups",
          "One treatment for everyone"
        ],
        "answer": 0,
        "explanation": "Pairs can be two similar units, with treatment allocation randomized within each pair."
      }
    ]
  },
  {
    "id": "1.B.5-3",
    "lesson": "1.B.5",
    "title": "Scope check",
    "context": "An SRS of town adults is randomly assigned to two training programs. A convincing difference is found.",
    "visual": {
      "type": "table",
      "headers": [
        "Random sampling?",
        "Random assignment?"
      ],
      "rows": [
        [
          "Yes",
          "Yes"
        ]
      ]
    },
    "questions": [
      {
        "prompt": "Generalize to the sampled population?",
        "choices": [
          "Yes, with study conditions and uncertainty considered",
          "No, never",
          "To all humans automatically"
        ],
        "answer": 0,
        "explanation": "Random sampling supports generalization to the population represented by the sampling frame."
      },
      {
        "prompt": "Evidence for a causal training effect?",
        "choices": [
          "Yes, from a well-conducted randomized comparison",
          "No, because it is a sample",
          "Only if every adult participated"
        ],
        "answer": 0,
        "explanation": "Random assignment supports causal inference when the evidence and study conduct warrant it."
      },
      {
        "prompt": "Would random assignment alone justify generalizing volunteers to all adults?",
        "choices": [
          "No",
          "Yes",
          "Only if scores are high"
        ],
        "answer": 0,
        "explanation": "Assignment and sampling serve different purposes; volunteer selection can limit generalizability."
      }
    ]
  },
  {
    "id": "1.B.5-4",
    "lesson": "1.B.5",
    "title": "Choose your claim",
    "context": "Compare these well-conducted studies; any reported effects have convincing statistical evidence.",
    "visual": {
      "type": "table",
      "headers": [
        "Study",
        "Random sample",
        "Random assignment"
      ],
      "rows": [
        [
          "A",
          "Yes",
          "No"
        ],
        [
          "B",
          "No; volunteers",
          "Yes"
        ],
        [
          "C",
          "No",
          "No"
        ]
      ]
    },
    "questions": [
      {
        "prompt": "Study A supports…",
        "choices": [
          "Population association, not causation",
          "Causation for everyone",
          "Neither any description nor association"
        ],
        "answer": 0,
        "explanation": "Random sampling supports population inference, but no assigned treatment establishes causation."
      },
      {
        "prompt": "Study B supports…",
        "choices": [
          "A causal effect for the studied volunteers, with limited generalization",
          "Automatic population generalization",
          "Only a correlation by definition"
        ],
        "answer": 0,
        "explanation": "Randomized treatment comparisons support causality; volunteer recruitment limits population scope."
      },
      {
        "prompt": "Study C warrants…",
        "choices": [
          "Describe the observed association; limit scope",
          "Claim causation for the population",
          "Assume all confounding is removed"
        ],
        "answer": 0,
        "explanation": "Without random sampling or assignment, both causal and population claims need restraint."
      }
    ]
  }
];
