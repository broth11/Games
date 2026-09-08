// Double Blind — question content. Edit THIS file to update questions/cards.
var CARDS = [
  /* ============ TIER 1 ============ */
  {
    kind:"build", tier:1,
    title:"Manuscript #114 \u2014 Timer & Task Completion",
    scenario:"Anjali wants to know whether a visible timer changes how long it takes someone to finish a small crossword. She recruits 44 volunteers and randomly splits them into two equal groups. One group solves the puzzle in a room with a timer on every desk; the other solves it in an identical room with no timer. Every volunteer gets the same puzzle at the same time of day. She records each person's solving time and compares the two group averages.",
    fields:[
      {label:"Experimental Units", correctText:"44 student volunteers", distractors:["The two rooms","The crossword puzzle itself","Anjali and her research assistant"]},
      {label:"Explanatory Variable", correctText:"Visibility of a timer", distractors:["Time of day","Room temperature","Puzzle difficulty"]},
      {label:"Treatments", correctText:"Timer on the desk / No timer on the desk", distractors:["Morning session / Evening session","Easy puzzle / Hard puzzle","Group A / Group B (no other difference)"]},
      {label:"Response Variable", correctText:"Time needed to complete the puzzle", distractors:["Number of volunteers recruited","Room temperature","Whether the timer was visible"]},
      {label:"Design Type", correctText:"Completely Randomized Design", distractors:["Randomized Block Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Solving speed","Puzzle difficulty","Room temperature"]}
    ]
  },
  {
    kind:"build", tier:1,
    title:"Manuscript #142 \u2014 Scarecrows in the Field",
    scenario:"A farmer wants to know if scarecrows reduce the number of birds landing in her fields. She has 20 similar fields and randomly assigns 10 to get a scarecrow and the other 10 to get nothing. After one week, she counts the birds spotted in each field and compares the two groups.",
    fields:[
      {label:"Experimental Units", correctText:"20 fields", distractors:["The birds that land in each field","The scarecrows","One week of observation"]},
      {label:"Explanatory Variable", correctText:"Whether a field has a scarecrow", distractors:["Number of birds spotted","Size of the field","Type of crop planted"]},
      {label:"Treatments", correctText:"Scarecrow / No scarecrow", distractors:["Morning count / Evening count","Large field / Small field","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Number of birds spotted", distractors:["Number of fields used","Whether a scarecrow was present","Type of crop planted"]},
      {label:"Design Type", correctText:"Completely Randomized Design", distractors:["Randomized Block Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Field location","Crop type","Time of day"]}
    ]
  },
  {
    kind:"build", tier:1,
    title:"Manuscript #156 \u2014 A Whitening Toothpaste",
    scenario:"A dental researcher wants to know if a new toothpaste whitens teeth more than a regular one. She recruits 60 volunteers and randomly assigns half to use the new toothpaste and half to use the regular toothpaste for one month, measuring each volunteer's tooth shade before and after with the same shade-scale camera.",
    fields:[
      {label:"Experimental Units", correctText:"60 volunteers", distractors:["Two toothpaste brands","The shade-scale camera","One month of brushing"]},
      {label:"Explanatory Variable", correctText:"Which toothpaste is used", distractors:["Tooth shade before the study","How often volunteers brush","Volunteer's age"]},
      {label:"Treatments", correctText:"New toothpaste / Regular toothpaste", distractors:["Before / After","Whitened / Not whitened","Camera on / Camera off"]},
      {label:"Response Variable", correctText:"Change in tooth shade", distractors:["Number of volunteers","Which toothpaste was assigned","Brand of toothpaste"]},
      {label:"Design Type", correctText:"Completely Randomized Design", distractors:["Randomized Block Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Volunteer's age","Starting tooth shade","Brushing frequency"]}
    ]
  },
  {
    kind:"build", tier:1,
    title:"Manuscript #163 \u2014 Grow Lights for Beans",
    scenario:"A biology class wants to know whether LED grow lights help bean plants grow taller than regular lamps. They plant 30 identical bean seeds in identical pots and randomly assign 15 pots to sit under LED grow lights and 15 under regular lamps. After three weeks, they measure each plant's height.",
    fields:[
      {label:"Experimental Units", correctText:"30 bean plants (in pots)", distractors:["The two types of light","Three weeks of growth","The classroom"]},
      {label:"Explanatory Variable", correctText:"Type of light used", distractors:["Plant height","Pot size","Amount of water given"]},
      {label:"Treatments", correctText:"LED grow light / Regular lamp", distractors:["Tall plant / Short plant","Week 1 / Week 3","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Plant height after three weeks", distractors:["Number of plants used","Type of light assigned","Pot size"]},
      {label:"Design Type", correctText:"Completely Randomized Design", distractors:["Randomized Block Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Seed size","Amount of sunlight in the room","Pot material"]}
    ]
  },
  {
    kind:"build", tier:1,
    title:"Manuscript #171 \u2014 A New Greeting Script",
    scenario:"A call center wants to know if a new greeting script leads to higher customer satisfaction than the old script. Over one week, each incoming call is randomly assigned to be answered with either the new script or the old script. At the end of every call, the customer rates satisfaction from 1 to 5.",
    fields:[
      {label:"Experimental Units", correctText:"The incoming calls", distractors:["The customer service agents","The two scripts","One week of calls"]},
      {label:"Explanatory Variable", correctText:"Which greeting script is used", distractors:["Customer satisfaction rating","Length of the call","Time of day the call comes in"]},
      {label:"Treatments", correctText:"New script / Old script", distractors:["Satisfied / Unsatisfied","Morning call / Afternoon call","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Customer satisfaction rating", distractors:["Number of calls received","Which script was used","Length of the call"]},
      {label:"Design Type", correctText:"Completely Randomized Design", distractors:["Randomized Block Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Time of day","Which agent answers","Customer's mood"]}
    ]
  },
  {
    kind:"showdown", tier:1,
    title:"Case File #08 \u2014 Whiter Teeth, No Comparison",
    question:"Which study design lets us actually test whether the new toothpaste itself causes whiter teeth?",
    weakerText:"A dentist gives the new toothpaste to 40 patients who ask for it and checks their tooth shade after a month. There's no other group to compare to.",
    strongerText:"A dentist randomly assigns 40 patients to either the new toothpaste or their regular toothpaste, then compares tooth shade after a month between the two groups.",
    correctReasonText:"The stronger design includes a comparison group, so any change can be checked against people who didn't get the new toothpaste.",
    reasonDistractors:["The stronger design used more patients.","The stronger design lasted longer.","All of the above"],
    explanation:"Without a comparison group, there's no way to know if patients' teeth would have gotten whiter anyway. Comparison is the most basic requirement of a well-designed experiment \u2014 everything else builds on having something to compare against."
  },
  {
    kind:"showdown", tier:1,
    title:"Case File #11 \u2014 Choosing Your Own Workout",
    question:"Which design allows a cause-and-effect conclusion about the new workout program?",
    weakerText:"A gym lets members choose whether to join a new 6-week workout program or continue their usual routine, then compares fitness scores between the two groups after 6 weeks.",
    strongerText:"A gym randomly assigns members to either the new 6-week workout program or their usual routine, then compares fitness scores after 6 weeks.",
    correctReasonText:"Random assignment balances things like existing fitness level and motivation between the groups, so any difference is more likely due to the program itself.",
    reasonDistractors:["The stronger design tracked members for longer.","The stronger design used a bigger gym.","All of the above"],
    explanation:"In the weaker design, members who choose the new program might already be more motivated or fit \u2014 a confounding variable. Random assignment in the stronger design spreads those differences evenly across both groups."
  },
  {
    kind:"showdown", tier:1,
    title:"Case File #14 \u2014 One Plot, One Guess",
    question:"Which design would give a more trustworthy estimate of the true difference between the two fertilizers?",
    weakerText:"A farmer tries Fertilizer A on 1 plot and Fertilizer B on 1 other plot, then compares yields.",
    strongerText:"A farmer randomly assigns Fertilizer A to 12 plots and Fertilizer B to 12 other plots, then compares average yields.",
    correctReasonText:"More plots per treatment (replication) reduces the effect of chance variation between individual plots, making a real difference easier to detect.",
    reasonDistractors:["The stronger design used a different fertilizer.","The stronger design measured yield in different units.","All of the above"],
    explanation:"With just 1 plot per treatment, any difference could easily be due to one plot having better soil or more sun \u2014 not the fertilizer. Replication helps average out that kind of chance variation."
  },
  {
    kind:"showdown", tier:1,
    title:"Case File #17 \u2014 Packaging, Two Seasons",
    question:"Which design better isolates the effect of the new packaging on sales?",
    weakerText:"A store puts the new packaging on a product for one month in summer and compares sales to last year's old-packaging sales from winter.",
    strongerText:"A store randomly assigns some weeks to display the new packaging and other weeks to display the old packaging, all within the same month, then compares sales.",
    correctReasonText:"Keeping the time period the same directly controls for seasonal shopping differences that could otherwise explain a sales difference.",
    reasonDistractors:["The stronger design sold more units overall.","The stronger design used a bigger store.","All of the above"],
    explanation:"Comparing summer sales to last year's winter sales confounds packaging with the season \u2014 people simply buy differently at different times of year. Running both versions within the same short period directly controls for that."
  },
  {
    kind:"showdown", tier:1,
    title:"Case File #20 \u2014 Flashcards, Chosen or Assigned",
    question:"Which study can support a claim that using flashcards causes higher vocabulary quiz scores?",
    weakerText:"A teacher notices that students who happen to use flashcards on their own tend to score higher on vocabulary quizzes, and reports the comparison.",
    strongerText:"A teacher randomly assigns half her class to use flashcards for a week and the other half to study their usual way, then compares quiz scores.",
    correctReasonText:"Only the stronger design imposes a treatment through random assignment, which is what allows a cause-and-effect claim instead of just an association.",
    reasonDistractors:["The stronger design used a longer quiz.","The stronger design had a bigger class.","All of the above"],
    explanation:"The weaker version is an observational study \u2014 students chose whether to use flashcards, so motivated or higher-performing students may have self-selected into that group. Only imposing the treatment via random assignment supports causation."
  },

  /* ============ TIER 2 ============ */
  {
    kind:"build", tier:2,
    title:"Manuscript #219 \u2014 Jen/John Application Study",
    scenario:"Experimenters print identical fake job applications for a lab-manager position, differing only in the name at the top: \u201cJennifer\u201d on half, \u201cJohn\u201d on the rest. 127 science faculty members are randomly sent one version each \u2014 63 get \u201cJohn,\u201d 64 get \u201cJennifer.\u201d Each faculty member rates the applicant\u2019s competence, \u201chireability,\u201d and starting salary, and the two groups\u2019 ratings are compared.",
    fields:[
      {label:"Experimental Units", correctText:"127 science faculty members", distractors:["The two job applications","63 male job candidates","The hiring committee"]},
      {label:"Explanatory Variable", correctText:"Gender implied by the applicant's name", distractors:["Faculty member's own gender","Applicant's actual qualifications","Department budget"]},
      {label:"Treatments", correctText:"\u201cJennifer\u201d application / \u201cJohn\u201d application", distractors:["Competence rating / Hireability rating","High salary offer / Low salary offer","Randomly assigned / Not randomly assigned"]},
      {label:"Response Variable", correctText:"Competence, hireability, and salary ratings", distractors:["Number of applications sent","Which name was used","Faculty members' years of experience"]},
      {label:"Design Type", correctText:"Completely Randomized Design", distractors:["Randomized Block Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Faculty member's department","Applicant's college GPA","Time of year applications were sent"]}
    ]
  },
  {
    kind:"build", tier:2,
    title:"Manuscript #308 \u2014 Darius's Commute",
    scenario:"Darius wants to know which of three routes to work is fastest on average. Over his next 30 commuting days, he randomly assigns one of the three routes to each day, so each route ends up used exactly 10 times. He leaves at the same time every day and records each day's commute time.",
    fields:[
      {label:"Experimental Units", correctText:"30 commuting days", distractors:["3 different routes","Darius himself","10 repeated trials"]},
      {label:"Explanatory Variable", correctText:"Which route is driven", distractors:["Time Darius leaves for work","Day of the week","Weather conditions"]},
      {label:"Treatments", correctText:"Route 1 / Route 2 / Route 3", distractors:["Morning / Afternoon","Fast / Slow","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Commute time", distractors:["Number of days recorded","Which route was assigned","Traffic level"]},
      {label:"Design Type", correctText:"Completely Randomized Design", distractors:["Randomized Block Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Day of the week","Weather","Route length"]}
    ]
  },
  {
    kind:"build", tier:2,
    title:"Manuscript #244 \u2014 Loud Music & Homework",
    scenario:"Carmen wants to know whether playing loud music increases the time it takes to complete math homework. She recruits 17 fourth graders and 23 eighth graders. Within each grade separately, she randomly assigns some students to do homework with loud music playing and the rest to do homework in silence, then compares completion times.",
    fields:[
      {label:"Experimental Units", correctText:"40 students (17 fourth graders, 23 eighth graders)", distractors:["The two grade levels","The math homework itself","Loud music playing"]},
      {label:"Explanatory Variable", correctText:"Whether loud music is playing", distractors:["Grade level","Time to complete homework","Number of students in each grade"]},
      {label:"Treatments", correctText:"Loud music / Silence", distractors:["Fourth grade / Eighth grade","Fast / Slow","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Time to complete the homework", distractors:["Grade level","Whether music was playing","Number of students"]},
      {label:"Design Type", correctText:"Randomized Block Design", distractors:["Completely Randomized Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"Grade level", distractors:["N/A \u2014 no blocking variable used","Time of day","Homework difficulty"]}
    ]
  },
  {
    kind:"build", tier:2,
    title:"Manuscript #251 \u2014 Who's Asking About AI?",
    scenario:"Researchers want to know whether being asked by a fellow student or by a professor changes how honestly college students report using AI for homework help. Within each of several college majors separately, students are randomly assigned to be asked the question by a fellow student or by a professor, and their reported AI use is recorded.",
    fields:[
      {label:"Experimental Units", correctText:"The college students surveyed", distractors:["The professors","The college majors","The fellow students asking"]},
      {label:"Explanatory Variable", correctText:"Who asks the question (fellow student or professor)", distractors:["College major","Reported AI use","Number of students per major"]},
      {label:"Treatments", correctText:"Asked by a fellow student / Asked by a professor", distractors:["High AI use / Low AI use","STEM major / Non-STEM major","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Reported AI use", distractors:["College major","Who asked the question","Number of majors included"]},
      {label:"Design Type", correctText:"Randomized Block Design", distractors:["Completely Randomized Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"College major", distractors:["N/A \u2014 no blocking variable used","Shirt color","Time of day surveyed"]}
    ]
  },
  {
    kind:"build", tier:2,
    title:"Manuscript #263 \u2014 Two Keyboards, One Typist",
    scenario:"A researcher wants to compare typing speed on a standard keyboard versus a compact keyboard. Each of 20 volunteers types the same paragraph on both keyboards, with a coin flip deciding which keyboard each volunteer uses first. Typing speed is recorded for each volunteer on each keyboard.",
    fields:[
      {label:"Experimental Units", correctText:"20 volunteers", distractors:["The two keyboards","The paragraph typed","The coin flips"]},
      {label:"Explanatory Variable", correctText:"Which keyboard is used", distractors:["Typing speed","Order of the keyboards","Volunteer's typing experience"]},
      {label:"Treatments", correctText:"Standard keyboard / Compact keyboard", distractors:["First attempt / Second attempt","Fast typist / Slow typist","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Typing speed", distractors:["Number of volunteers","Which keyboard came first","Keyboard brand"]},
      {label:"Design Type", correctText:"Matched Pairs Design", distractors:["Completely Randomized Design","Randomized Block Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Volunteer's typing experience","Keyboard brand","Order typed"]}
    ]
  },
  {
    kind:"showdown", tier:2,
    title:"Case File #22 \u2014 Social Media & Anxiety",
    question:"Both designs randomly assign treatment. Which is more likely to reveal a real anxiety-reducing effect, if one exists?",
    weakerText:"230 student volunteers are split into two groups completely at random. One group limits social media to 30 minutes a day; the other uses it as normal. After two weeks, anxiety scores are compared between the two groups.",
    strongerText:"The same 230 volunteers are first sorted into two groups \u2014 female and not female \u2014 since female students tend to start with higher baseline anxiety. Within each group, students are randomly assigned to the 30-minute limit or normal use. Anxiety scores are compared within each group, then combined.",
    correctReasonText:"Groups students by a variable related to the response before randomizing, which reduces variability within each comparison.",
    reasonDistractors:["Recruited more participants than the other design.","Used a placebo group.","All of the above"],
    explanation:"This is a randomized block design: blocking by gender first removes the baseline anxiety gap between blocks, so the treatment comparison within each block isn't muddied by it. Both designs actually used the same 230 volunteers, and neither used a placebo."
  },
  {
    kind:"showdown", tier:2,
    title:"Case File #27 \u2014 Major vs. Shirt Color",
    question:"For the AI-homework-honesty study, which blocking choice would make a real difference between 'asked by a student' and 'asked by a professor' easier to detect?",
    weakerText:"Block students by shirt color, then randomly assign within each shirt-color group whether they're asked by a fellow student or a professor.",
    strongerText:"Block students by college major, then randomly assign within each major group whether they're asked by a fellow student or a professor.",
    correctReasonText:"Major is likely related to how much homework AI could help with, so blocking by it removes that source of variability; shirt color has no such connection.",
    reasonDistractors:["Blocking by major used more students.","Blocking by major took less time to run.","All of the above"],
    explanation:"A good blocking variable needs to be related to the response. College major plausibly affects how often AI comes up in homework; shirt color doesn't. Blocking by an irrelevant variable does nothing to reduce variability."
  },
  {
    kind:"showdown", tier:2,
    title:"Case File #29 \u2014 A Drug With No Placebo",
    question:"Which design better isolates the true effect of the new arthritis drug?",
    weakerText:"Patients are given the new drug and their range of motion is measured before and after, with no comparison group.",
    strongerText:"Patients are randomly assigned to the new drug or a placebo, and their range of motion is measured before and after in both groups.",
    correctReasonText:"The placebo control group lets researchers separate the drug's real effect from the placebo effect and from natural improvement over time.",
    reasonDistractors:["The stronger design measured range of motion more precisely.","The stronger design recruited older patients.","All of the above"],
    explanation:"Without a comparison group, any improvement could be due to the placebo effect, natural healing, or just paying more attention to the joint \u2014 not the drug itself. A randomly assigned placebo group rules those alternative explanations out."
  },
  {
    kind:"showdown", tier:2,
    title:"Case File #33 \u2014 Morning Workouts, Afternoon Energy",
    question:"Which study supports a causal claim that a morning workout increases afternoon energy levels?",
    weakerText:"Researchers survey office workers about whether they work out in the morning and rate their own afternoon energy levels, then compare the two groups.",
    strongerText:"Office workers are randomly assigned to either do a morning workout or not for two weeks, and their afternoon energy levels are rated by an independent observer.",
    correctReasonText:"Random assignment rules out confounding variables \u2014 like people who already sleep well being more likely to both work out and feel energetic \u2014 that the observational version can't rule out.",
    reasonDistractors:["The stronger design used self-reported energy levels.","The stronger design ran for a shorter time.","All of the above"],
    explanation:"In the weaker design, workers who choose to work out in the morning might just generally take better care of themselves \u2014 sleep, diet, etc. \u2014 which would also boost energy. Only random assignment in the stronger design controls for that."
  },

  {
    kind:"showdown", tier:2,
    title:"Case File #36 \u2014 Sports Drink, Chosen or Assigned",
    question:"Which design allows researchers to conclude the new sports drink itself improved race times?",
    weakerText:"Athletes who prefer the new sports drink are compared to athletes who prefer water, based on their most recent race times.",
    strongerText:"Athletes are randomly assigned to drink either the new sports drink or water during training, then compared on a standardized time trial.",
    correctReasonText:"Random assignment balances athletic ability and training habits between the groups, so the drink itself \u2014 not pre-existing differences \u2014 is the more likely explanation for any time difference.",
    reasonDistractors:["The stronger design used professional athletes.","The stronger design measured times in different units.","All of the above"],
    explanation:"Athletes who already prefer a sports drink might simply train harder or be more competitive \u2014 a confounding variable the weaker design can't separate from the drink's actual effect. Random assignment addresses that directly."
  },

  /* ============ TIER 3 ============ */
  {
    kind:"build", tier:3,
    title:"Manuscript #372 \u2014 A Double-Blind Headache Trial",
    scenario:"Researchers test a new headache medication against a placebo. Patients are randomly assigned to receive either the medication or an identical-looking placebo pill. Neither the patients nor the nurses recording symptom relief know which pill any patient received. Symptom relief is compared between the two groups.",
    fields:[
      {label:"Experimental Units", correctText:"The patients in the study", distractors:["The nurses","The two pills","The headache symptoms"]},
      {label:"Explanatory Variable", correctText:"Whether the medication or placebo is given", distractors:["Symptom relief","Which nurse records the data","Patient's headache history"]},
      {label:"Treatments", correctText:"New medication / Placebo", distractors:["Relief reported / No relief reported","Nurse A / Nurse B","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Symptom relief", distractors:["Number of patients","Which pill was given","Whether the study was blind"]},
      {label:"Design Type", correctText:"Completely Randomized Design", distractors:["Randomized Block Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Patient's headache history","Which nurse administers the pill","Time of day the pill is taken"]}
    ]
  },
  {
    kind:"build", tier:3,
    title:"Manuscript #381 \u2014 Two Golf Balls, One Golfer",
    scenario:"A golf equipment tester wants to compare the driving distance of two golf ball brands. Each of 15 golfers hits one ball of each brand, with the order of brands randomly determined for each golfer. Distance is recorded for each ball each golfer hits.",
    fields:[
      {label:"Experimental Units", correctText:"15 golfers", distractors:["The two golf ball brands","The golf course","The golfers' clubs"]},
      {label:"Explanatory Variable", correctText:"Which golf ball brand is used", distractors:["Driving distance","Order the balls were hit in","Golfer's skill level"]},
      {label:"Treatments", correctText:"Brand A / Brand B", distractors:["First hit / Second hit","Long drive / Short drive","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Driving distance", distractors:["Number of golfers","Which brand was hit first","Golfer's skill level"]},
      {label:"Design Type", correctText:"Matched Pairs Design", distractors:["Completely Randomized Design","Randomized Block Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Golfer's skill level","Weather conditions","Golf ball brand"]}
    ]
  },
  {
    kind:"build", tier:3,
    title:"Manuscript #390 \u2014 Chronotypes & Sleep Quality",
    scenario:"Researchers want to know if a new sleep app improves sleep quality. Because 'morning people' and 'night owls' tend to have very different baseline sleep quality, participants are first sorted into those two groups. Within each group, participants are randomly assigned to use the sleep app or not, and sleep quality is compared within each group before combining results.",
    fields:[
      {label:"Experimental Units", correctText:"The study participants", distractors:["The sleep app","Morning people and night owls (the two groups)","The nights of sleep tracked"]},
      {label:"Explanatory Variable", correctText:"Whether the sleep app is used", distractors:["Chronotype (morning person or night owl)","Sleep quality","Number of participants"]},
      {label:"Treatments", correctText:"Sleep app / No sleep app", distractors:["Morning person / Night owl","Good sleep / Poor sleep","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Sleep quality", distractors:["Chronotype","Whether the app was used","Number of nights tracked"]},
      {label:"Design Type", correctText:"Randomized Block Design", distractors:["Completely Randomized Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"Chronotype (morning person or night owl)", distractors:["N/A \u2014 no blocking variable used","Age","Bedtime"]}
    ]
  },
  {
    kind:"build", tier:3,
    title:"Manuscript #401 \u2014 Instruments & Grades (No Treatment)",
    scenario:"A researcher wants to know whether students who play a musical instrument tend to have higher math grades. She surveys 200 students, asking whether they play an instrument, and looks up their current math grade from school records. No treatment is assigned to anyone.",
    fields:[
      {label:"Experimental Units", correctText:"N/A \u2014 this is an observational study, not an experiment", distractors:["200 students","Musical instruments","Math grades"]},
      {label:"Explanatory Variable", correctText:"Whether a student plays a musical instrument", distractors:["Math grade","Number of students surveyed","School record system"]},
      {label:"Treatments", correctText:"N/A \u2014 this is an observational study, not an experiment", distractors:["Plays an instrument / Doesn't play","High grade / Low grade","Random / Nonrandom"]},
      {label:"Response Variable", correctText:"Math grade", distractors:["Whether a student plays a musical instrument","Number of students surveyed","Type of instrument played"]},
      {label:"Design Type", correctText:"Observational study (no design needed)", distractors:["Completely Randomized Design","Randomized Block Design","Matched Pairs Design"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 this is an observational study, not an experiment", distractors:["Type of instrument","Grade level","Hours practiced per week"]}
    ]
  },
  {
    kind:"build", tier:3,
    title:"Manuscript #414 \u2014 A Random Sample, Randomly Assigned",
    scenario:"Researchers take a random sample of 500 adults from the national voter registry, then randomly assign each selected adult to read either a positive or negative news headline about a policy, and measure their support for the policy afterward.",
    fields:[
      {label:"Experimental Units", correctText:"500 randomly sampled adults", distractors:["The national voter registry","The two headlines","The policy itself"]},
      {label:"Explanatory Variable", correctText:"Which headline is read (positive or negative)", distractors:["Policy support","Whether the adult was in the voter registry","Number of adults sampled"]},
      {label:"Treatments", correctText:"Positive headline / Negative headline", distractors:["Supports policy / Opposes policy","Random sample / Nonrandom sample","Adult / Non-adult"]},
      {label:"Response Variable", correctText:"Level of support for the policy", distractors:["Number of adults sampled","Which headline was read","Whether the sample was random"]},
      {label:"Design Type", correctText:"Completely Randomized Design", distractors:["Randomized Block Design","Matched Pairs Design","Observational study (no design needed)"]},
      {label:"Blocking Variable", correctText:"N/A \u2014 no blocking variable used", distractors:["Political party","Age","Region"]}
    ]
  },
  {
    kind:"showdown", tier:3,
    title:"Case File #31 \u2014 The Pottery Wheel",
    question:"Both designs compare the same potter under both wheel directions. Which comparison is trustworthy?",
    weakerText:"Jordan has each potter throw two identical cylinders \u2014 the first on a clockwise wheel, the second on a counterclockwise wheel \u2014 and times both. Every potter does clockwise first.",
    strongerText:"Jordan has each potter throw two identical cylinders, one on each wheel direction, but flips a coin for each potter to decide which direction they use first.",
    correctReasonText:"Randomizing the order means practice effects are spread evenly across both wheel directions instead of always favoring one.",
    reasonDistractors:["Used a larger sample of potters.","Measured a categorical response instead of time.","All of the above"],
    explanation:"This is a matched-pairs design either way, but only the stronger version randomizes which treatment each potter gets first. In the weaker version, every potter is more practiced on their second cylinder \u2014 always the counterclockwise one \u2014 so wheel direction is confounded with practice."
  },
  {
    kind:"showdown", tier:3,
    title:"Case File #40 \u2014 The Vaccine Trial",
    question:"Which manuscript supports the claim that the vaccine caused a reduction in Covid-19 severity?",
    weakerText:"Researchers compare Covid-19 death rates between people who chose to get vaccinated and people who didn't, using existing health records.",
    strongerText:"30,420 adult volunteers are randomly assigned to receive either the vaccine or a placebo shot, and neither the participants nor the staff administering doses know which one anyone received. Illness rates are compared between the two groups.",
    correctReasonText:"All of the above",
    reasonDistractors:["Random assignment balances confounding variables like health-consciousness between the two groups.","The placebo control isolates the vaccine's real effect from any placebo effect.","Double-blinding prevents staff from favoring one group when recording illness."],
    explanation:"The weaker manuscript is purely observational \u2014 no conditions were imposed, so confounders (like who tends to seek out vaccination) can't be ruled out. The stronger one is a well-designed experiment: random assignment, a placebo control, and double-blinding are all doing real work, which is why \u2018all of the above\u2019 is genuinely the answer this time."
  },
  {
    kind:"showdown", tier:3,
    title:"Case File #44 \u2014 Single-Blind vs. Double-Blind",
    question:"Both designs randomly assign a new pain reliever versus a placebo. Which design better protects against bias in the results?",
    weakerText:"Patients don't know whether they received the pain reliever or the placebo, but the nurses recording their pain scores do know which patients got which.",
    strongerText:"Neither the patients nor the nurses recording pain scores know who received the pain reliever or the placebo.",
    correctReasonText:"Double-blinding also prevents the nurses' knowledge from unconsciously influencing how they record pain scores, on top of controlling the placebo effect.",
    reasonDistractors:["The stronger design used more patients.","The stronger design lasted longer.","All of the above"],
    explanation:"The weaker design is single-blind \u2014 it controls the placebo effect but leaves room for the nurses (who know the assignment) to unintentionally score patients differently based on that knowledge. Double-blinding removes that source of bias too."
  },
  {
    kind:"showdown", tier:3,
    title:"Case File #48 \u2014 One School vs. the Whole District",
    question:"Both studies randomly assign the same reading intervention versus normal instruction. Which study's results can be generalized to all fifth graders in the district?",
    weakerText:"Researchers use the fifth graders at one volunteer school and randomly assign them to the intervention or normal instruction.",
    strongerText:"Researchers take a random sample of fifth graders from across the entire district and randomly assign each one to the intervention or normal instruction.",
    correctReasonText:"Only a random sample from the full district supports generalizing results back to that whole population; a single volunteer school does not.",
    reasonDistractors:["The stronger design has a larger effect size.","The stronger design is cheaper to run.","All of the above"],
    explanation:"Random assignment (present in both) is what supports a causal conclusion. But generalizing beyond the students actually studied requires random sampling from the target population \u2014 the weaker design's results only generalize to schools like the one volunteer school, not the whole district."
  },
  {
    kind:"showdown", tier:3,
    title:"Case File #52 \u2014 Twins, Kept Together or Pooled",
    question:"A researcher wants to compare two pain-relief creams using pairs of identical twins (one twin per pair gets each cream). Which design correctly matches this setup?",
    weakerText:"Treat this as a completely randomized design: pool all the twins together and randomly assign each individual twin to one cream or the other, ignoring pairs.",
    strongerText:"Treat this as a matched pairs design: within each twin pair, randomly assign one twin to each cream, keeping pairs together in the analysis.",
    correctReasonText:"Twins are naturally matched on genetics and often environment, so comparing within each pair removes that shared variability instead of throwing it away.",
    reasonDistractors:["The stronger design used more twin pairs.","The stronger design measured relief on a different scale.","All of the above"],
    explanation:"Pooling the twins and ignoring pairs wastes the built-in matching \u2014 two twins from the same pair are more similar to each other than to a random stranger. Comparing within pairs (matched pairs design) uses that similarity to make the treatment comparison more precise."
  }
];
