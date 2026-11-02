#!/usr/bin/env python3
"""Build BoardTube's 54-chapter All-India Class 12 & Class 10 Boards YouTube index (data/videos.json).

Covers CBSE, ISC, and all major Indian State Boards (Maharashtra HSC/SSC, Tamil Nadu Board,
Kerala Plus Two/SSLC, AP/TS IPE & SSC, Karnataka PUC/SSLC, WBCHSE/Madhyamik, GSEB Gujarat,
BSEB Bihar, UPMSP, RBSE, CHSE Odisha, PSEB Punjab) across all 12 popular Indian languages.

Ranked 100% by pure organic YouTube trend velocity (views_per_month, view_count, lesson_count)
with ZERO artificial coaching or institute priority.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
import ssl
import sys
import threading
import time
import urllib.parse
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT / "data" / "cache"
SIBLING_CACHES = [
    CACHE_DIR,
    ROOT.parent / "neettube" / "data" / "cache",
    ROOT.parent / "jeetube" / "data" / "cache",
    ROOT.parent / "upboardtube" / "data" / "cache",
]
OUT_PATH = ROOT / "data" / "videos.json"

INNERTUBE_SEARCH = "https://www.youtube.com/youtubei/v1/search"
SP_PLAYLIST_ONLY = "EgIQAw=="
SP_LONG_VIDEOS = "EgIYAg=="

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


def _ssl_context() -> ssl.SSLContext:
    for cafile in ("/etc/ssl/cert.pem", "/etc/ssl/certs/ca-certificates.crt"):
        if os.path.exists(cafile):
            return ssl.create_default_context(cafile=cafile)
    return ssl.create_default_context()


SSL_CTX = _ssl_context()
_lock = threading.Lock()
STATS = {"requests": 0, "cached": 0}
MIN_VIDEO_SECONDS = 600  # >= 10 minutes for substantial board lectures & one-shots

# (ch_no, subject, unit, class_level, weightage, chapter_name, regex, pl_q, vid_q1, vid_q2)
SYLLABUS: list[tuple[int, str, str, str, str, str, str, str, str, str]] = [
    # ============ 1. CLASS 12 PHYSICS (Ch 1–10) ============
    (1, "Class 12 Physics", "Electrostatics", "Class 12", "Very High",
     "Electric Charges, Fields, Potential & Capacitance",
     r"(electric\s+charges?|electrostatics?|coulomb|gauss|electric\s+potential|capacit\w*|वैद्युत\s*आवेश|स्थिर\s*वैद्युतिकी|विभव|धारिता)",
     "Electric Charges and Fields Class 12 Physics Playlist",
     "Electric Charges Fields Electrostatic Potential Capacitance Class 12 One Shot",
     "Electrostatics Class 12 Board Physics Arvind Academy Abhishek Sahu NCERT Wallah"),
    (2, "Class 12 Physics", "Current Electricity", "Class 12", "Very High",
     "Current Electricity & Circuits",
     r"(current\s+electricity|kirchhoff|wheatstone|ohm'?s\s+law|drift\s+velocity|potentiometer|विद्युत\s*धारा|वैद्युत\s*धारा)",
     "Current Electricity Class 12 Physics Playlist",
     "Current Electricity Class 12 Physics One Shot Board",
     "Current Electricity Class 12 Arvind Academy Radhika Classes Munil Sir"),
    (3, "Class 12 Physics", "Magnetism", "Class 12", "High",
     "Moving Charges & Magnetism",
     r"(moving\s+charges|magnetism|biot[\s-]*savart|ampere|galvanometer|magnetic\s+effect|गतिमान\s*आवेश|चुंबकत्व)",
     "Moving Charges and Magnetism Class 12 Playlist",
     "Moving Charges and Magnetism Magnetism and Matter Class 12 One Shot",
     "Moving Charges and Magnetism Class 12 Board Arvind Academy NCERT Wallah"),
    (4, "Class 12 Physics", "EMI & Alternating Current", "Class 12", "Very High",
     "Electromagnetic Induction & Alternating Current",
     r"(electromagnetic\s+induction|\bemi\b|faraday|lenz|alternating\s+current|\blcr\b|transformer|वैद्युतचुंबकीय\s*प्रेरण|प्रत्यावर्ती\s*धारा)",
     "Electromagnetic Induction Alternating Current Class 12 Playlist",
     "Electromagnetic Induction and Alternating Current Class 12 One Shot",
     "Alternating Current EMI Class 12 Physics Board One Shot"),
    (5, "Class 12 Physics", "Optics", "Class 12", "Very High",
     "Ray Optics & Optical Instruments",
     r"(ray\s+optics|optical\s+instruments?|refraction|prism|lens\s+maker|microscope|telescope|किरण\s*प्रकाशिकी|प्रकाशिक\s*यंत्र)",
     "Ray Optics and Optical Instruments Class 12 Playlist",
     "Ray Optics and Optical Instruments Class 12 One Shot Board",
     "Ray Optics Class 12 Physics Arvind Academy Abhishek Sahu Munil Sir"),
    (6, "Class 12 Physics", "Optics & EM Waves", "Class 12", "High",
     "Wave Optics & Electromagnetic Waves",
     r"(wave\s+optics|huygens|interference|diffraction|\bydse\b|electromagnetic\s+waves?|\bem\s+waves?\b|तरंग\s*प्रकाशिकी)",
     "Wave Optics Electromagnetic Waves Class 12 Playlist",
     "Wave Optics Class 12 Physics One Shot Board",
     "Wave Optics EM Waves Class 12 NCERT Wallah Arvind Academy"),
    (7, "Class 12 Physics", "Modern Physics", "Class 12", "Very High",
     "Dual Nature of Radiation, Atoms & Nuclei",
     r"(dual\s+nature|photoelectric|de\s+broglie|\batoms\b|\bnuclei\b|bohr|nuclear|द्वैत\s*प्रकृति|परमाणु|नाभिक)",
     "Dual Nature Atoms and Nuclei Class 12 Physics Playlist",
     "Dual Nature of Radiation Atoms and Nuclei Class 12 One Shot",
     "Modern Physics Dual Nature Atoms Nuclei Class 12 Board One Shot"),
    (8, "Class 12 Physics", "Electronics", "Class 12", "Very High",
     "Semiconductor Electronics & Logic Gates",
     r"(semiconductor\w*|p[\s-]*n\s+junction|rectifier|diode|logic\s+gates?|अर्धचालक)",
     "Semiconductor Electronics Class 12 Physics Playlist",
     "Semiconductor Electronics Class 12 One Shot Board",
     "Semiconductor Class 12 Physics Arvind Academy Abhishek Sahu NCERT Wallah"),
    (9, "Class 12 Physics", "Derivations & Marathons", "Class 12", "Very High",
     "Class 12 Physics All Derivations & Full-Syllabus Marathons",
     r"(all\s+derivations?|important\s+derivations?|complete\s+(?:class\s*12\s+)?physics|full\s+physics\s+marathon|physics\s+mahamarathon|सम्पूर्ण\s*भौतिकी)",
     "Class 12 Physics Derivations Revision Playlist",
     "All Derivations Class 12 Physics One Shot Board Exam",
     "Complete Class 12 Physics Marathon One Shot CBSE State Board"),
    (10, "Class 12 Physics", "Board PYQs & Sample Papers", "Class 12", "High",
     "Class 12 Physics Board Sample Papers, PYQs & Numericals",
     r"(physics).*(sample\s+paper|pyq\w*|previous\s+year|model\s+paper|important\s+(?:questions|numericals)|board\s+paper|महत्वपूर्ण\s*प्रश्न|मॉडल\s*पेपर)|(sample\s+paper|pyq\w*|important\s+numericals).*(physics)",
     "Class 12 Physics PYQ Sample Paper Playlist",
     "Class 12 Physics Previous Year Questions Sample Paper One Shot",
     "Class 12 Physics Most Important Questions Numericals Board Exam"),

    # ============ 2. CLASS 12 CHEMISTRY (Ch 11–20) ============
    (11, "Class 12 Chemistry", "Physical Chemistry", "Class 12", "Very High",
     "Solutions & Colligative Properties",
     r"(\bsolutions?\b|colligative|raoult|molarity|van'?t\s+hoff|विलयन)",
     "Solutions Class 12 Chemistry Playlist Bharat Panchal",
     "Solutions Class 12 Chemistry One Shot Board",
     "Solutions Class 12 Sourabh Raina Bharat Panchal NCERT Wallah"),
    (12, "Class 12 Chemistry", "Physical Chemistry", "Class 12", "Very High",
     "Electrochemistry",
     r"(electrochemistry|nernst|kohlrausch|faraday|galvanic|conductance|वैद्युत\s*रसायन|विद्युत\s*रसायन)",
     "Electrochemistry Class 12 Chemistry Playlist",
     "Electrochemistry Class 12 Chemistry One Shot Board",
     "Electrochemistry Class 12 Bharat Panchal Sourabh Raina NCERT Wallah"),
    (13, "Class 12 Chemistry", "Physical Chemistry", "Class 12", "High",
     "Chemical Kinetics",
     r"(chemical\s+kinetics|\bkinetics\b|rate\s+of\s+reaction|order\s+of\s+reaction|arrhenius|रासायनिक\s*बलगतिकी)",
     "Chemical Kinetics Class 12 Chemistry Playlist",
     "Chemical Kinetics Class 12 One Shot Board",
     "Chemical Kinetics Class 12 Bharat Panchal Sourabh Raina"),
    (14, "Class 12 Chemistry", "Inorganic Chemistry", "Class 12", "High",
     "d- and f-Block Elements",
     r"(d\s*(?:and|&)\s*f[\s-]*block|transition\s+elements?|lanthanoids?|actinoids?|d\s*एवं\s*f\s*ब्लॉक)",
     "d and f Block Elements Class 12 Chemistry Playlist",
     "d and f Block Elements Class 12 One Shot Board",
     "d and f Block Class 12 Bharat Panchal Sourabh Raina NCERT Wallah"),
    (15, "Class 12 Chemistry", "Inorganic Chemistry", "Class 12", "Very High",
     "Coordination Compounds",
     r"(coordination\s+compounds?|werner|crystal\s+field|\bcft\b|ligands?|उपसहसंयोजन\s*यौगिक)",
     "Coordination Compounds Class 12 Chemistry Playlist",
     "Coordination Compounds Class 12 One Shot Board",
     "Coordination Compounds Class 12 Bharat Panchal Sourabh Raina"),
    (16, "Class 12 Chemistry", "Organic Chemistry", "Class 12", "Very High",
     "Haloalkanes & Haloarenes",
     r"(haloalkanes?|haloarenes?|halogen\s+derivatives?|\bsn1\b|\bsn2\b|हैलोएल्केन|हैलोऐरीन)",
     "Haloalkanes and Haloarenes Class 12 Playlist",
     "Haloalkanes and Haloarenes Class 12 One Shot Board",
     "Haloalkanes Haloarenes Class 12 Bharat Panchal Sourabh Raina NCERT Wallah"),
    (17, "Class 12 Chemistry", "Organic Chemistry", "Class 12", "Very High",
     "Alcohols, Phenols & Ethers",
     r"(alcohols?|phenols?|ethers?|रीमर|कोल्बे|ऐल्कोहॉल|फीनॉल|ईथर)",
     "Alcohols Phenols and Ethers Class 12 Playlist",
     "Alcohols Phenols and Ethers Class 12 One Shot Board",
     "Alcohols Phenols Ethers Class 12 Bharat Panchal Sourabh Raina"),
    (18, "Class 12 Chemistry", "Organic Chemistry", "Class 12", "Very High",
     "Aldehydes, Ketones & Carboxylic Acids",
     r"(aldehydes?|ketones?|carboxylic\s+acids?|aldol|cannizzaro|ऐल्डिहाइड|कीटोन|कार्बोक्सिलिक)",
     "Aldehydes Ketones and Carboxylic Acids Class 12 Playlist",
     "Aldehydes Ketones and Carboxylic Acids Class 12 One Shot Board",
     "Aldehydes Ketones Carboxylic Acids Class 12 Bharat Panchal Sourabh Raina"),
    (19, "Class 12 Chemistry", "Organic Chemistry", "Class 12", "High",
     "Amines & Biomolecules",
     r"(\bamines?\b|diazonium|biomolecules?|carbohydrates?|proteins?|nucleic\s+acids?|ऐमीन|जैव\s*अणु)",
     "Amines and Biomolecules Class 12 Chemistry Playlist",
     "Amines Biomolecules Class 12 Chemistry One Shot Board",
     "Amines and Biomolecules Class 12 Bharat Panchal Sourabh Raina"),
    (20, "Class 12 Chemistry", "Reactions & Sample Papers", "Class 12", "Very High",
     "Organic Named Reactions, Conversions & Board Sample Papers",
     r"(name\w*\s+reactions?|organic\s+conversions?|complete\s+(?:organic\s+)?chemistry|chemistry\s+(?:sample\s+paper|pyq\w*|marathon|model\s+paper)|महत्वपूर्ण\s*अभिक्रिया|मॉडल\s*पेपर)",
     "All Name Reactions Organic Conversions Class 12 Chemistry Playlist",
     "All Name Reactions Organic Conversions Class 12 Chemistry One Shot",
     "Class 12 Chemistry Complete PYQ Sample Paper Marathon Bharat Panchal Sourabh Raina"),

    # ============ 3. CLASS 12 MATHS (Ch 21–30) ============
    (21, "Class 12 Maths", "Relations & Functions", "Class 12", "High",
     "Relations, Functions & Inverse Trigonometric Functions",
     r"(relations?\s*(?:and|&)\s*functions?|inverse\s+trigonometric|\bitf\b|संबंध\s*एवं\s*फलन|प्रतिलोम\s*त्रिकोणमितीय)",
     "Relations and Functions Inverse Trigonometric Functions Class 12 Playlist",
     "Relations and Functions Inverse Trigonometric Class 12 One Shot",
     "Relations Functions ITF Class 12 Maths CBSE Neha Agrawal Anurag Chauhan"),
    (22, "Class 12 Maths", "Algebra", "Class 12", "Very High",
     "Matrices & Determinants",
     r"(matrices|matrix|determinants?|आव्यूह|सारणिक)",
     "Matrices and Determinants Class 12 Maths Playlist",
     "Matrices and Determinants Class 12 Maths One Shot Board",
     "Matrices Determinants Class 12 CBSE Maths NCERT Wallah Science and Fun"),
    (23, "Class 12 Maths", "Calculus", "Class 12", "Very High",
     "Continuity & Differentiability",
     r"(continuity|differentiability|differentiation|derivatives?|सांतत्य|अवकलनीयता|अवकलन)",
     "Continuity and Differentiability Class 12 Maths Playlist",
     "Continuity and Differentiability Class 12 One Shot Board",
     "Continuity Differentiability Class 12 Maths NCERT Wallah Anurag Chauhan"),
    (24, "Class 12 Maths", "Calculus", "Class 12", "Very High",
     "Applications of Derivatives (AOD)",
     r"(applications?\s+of\s+derivatives?|\baod\b|maxima\s*(?:and|&)?\s*minima|increasing\s*(?:and|&)?\s*decreasing|अवकलज\s*के\s*अनुप्रयोग)",
     "Application of Derivatives Class 12 Maths Playlist",
     "Application of Derivatives Class 12 Maths One Shot Board",
     "Application of Derivatives Class 12 CBSE Maths One Shot"),
    (25, "Class 12 Maths", "Calculus", "Class 12", "Very High",
     "Indefinite & Definite Integrals",
     r"(\bintegrals?\b|integration|indefinite\s+integr\w*|definite\s+integr\w*|समाकलन)",
     "Integrals Class 12 Maths NCERT Playlist",
     "Integrals Class 12 Maths Complete One Shot Board",
     "Integrals Integration Class 12 CBSE Maths NCERT Wallah Anurag Chauhan"),
    (26, "Class 12 Maths", "Calculus", "Class 12", "High",
     "Application of Integrals & Differential Equations",
     r"(application\w*\s+of\s+integrals?|area\s+under|differential\s+equations?|अवकल\s*समीकरण|समाकलनों\s*के\s*अनुप्रयोग)",
     "Application of Integrals Differential Equations Class 12 Playlist",
     "Application of Integrals and Differential Equations Class 12 One Shot",
     "Differential Equations Area Class 12 Maths Board One Shot"),
    (27, "Class 12 Maths", "Vectors & 3D", "Class 12", "High",
     "Vector Algebra",
     r"(vector\s+algebra|\bvectors?\b|dot\s+product|cross\s+product|सदिश\s*बीजगणित|सदिश)",
     "Vector Algebra Class 12 Maths Playlist",
     "Vector Algebra Class 12 Maths One Shot Board",
     "Vector Algebra Class 12 CBSE Maths NCERT Wallah"),
    (28, "Class 12 Maths", "Vectors & 3D", "Class 12", "Very High",
     "Three-Dimensional Geometry (3D)",
     r"(three[\s-]*dimensional\s+geometry|3\s*d\s+geometry|shortest\s+distance|skew\s+lines|त्रिविमीय\s*ज्यामिति)",
     "Three Dimensional Geometry Class 12 Maths Playlist",
     "3D Geometry Three Dimensional Geometry Class 12 One Shot",
     "3D Geometry Class 12 CBSE Maths Board One Shot"),
    (29, "Class 12 Maths", "LPP & Probability", "Class 12", "Very High",
     "Linear Programming & Probability",
     r"(linear\s+programming|\blpp\b|probability|bayes'?s?\s+theorem|conditional\s+probability|प्रायिकता|रैखिक\s*प्रोग्रामन)",
     "Probability Linear Programming Class 12 Maths Playlist",
     "Probability and Linear Programming Class 12 Maths One Shot",
     "Probability Class 12 CBSE Maths Board One Shot"),
    (30, "Class 12 Maths", "Board PYQs & Marathons", "Class 12", "Very High",
     "Class 12 Maths Formulas, PYQs & Board Sample Papers",
     r"(maths?|mathematics).*(all\s+formulas?|sample\s+paper|pyq\w*|previous\s+year|marathon|model\s+paper|complete\s+class\s*12)|(sample\s+paper|all\s+formulas?).*(class\s*12\s+maths?)",
     "Class 12 Maths PYQ Sample Paper Playlist",
     "Complete Class 12 Maths Marathon PYQ Sample Paper One Shot",
     "Class 12 Maths Most Important Questions All Formulas Board Exam"),

    # ============ 4. CLASS 12 BIOLOGY (Ch 31–38) ============
    (31, "Class 12 Biology", "Reproduction", "Class 12", "Very High",
     "Sexual Reproduction in Flowering Plants",
     r"(sexual\s+reproduction\s+in\s+flowering|flowering\s+plants?|pollination|double\s+fertilization|पुष्पी\s*पादपों\s*में\s*लैंगिक)",
     "Sexual Reproduction in Flowering Plants Class 12 Playlist",
     "Sexual Reproduction in Flowering Plants Class 12 One Shot Board",
     "Sexual Reproduction in Flowering Plants Class 12 NCERT Wallah Sourabh Raina"),
    (32, "Class 12 Biology", "Reproduction", "Class 12", "Very High",
     "Human Reproduction & Reproductive Health",
     r"(human\s+reproduction|reproductive\s+health|gametogenesis|menstrual\s+cycle|मानव\s*जनन|जनन\s*स्वास्थ्य)",
     "Human Reproduction Reproductive Health Class 12 Playlist",
     "Human Reproduction and Reproductive Health Class 12 One Shot",
     "Human Reproduction Class 12 Biology Board One Shot"),
    (33, "Class 12 Biology", "Genetics & Evolution", "Class 12", "Very High",
     "Principles of Inheritance & Variation",
     r"(principles?\s+of\s+inheritance|mendel\w*|genetics|linkage|pedigree|वंशागति\s*तथा\s*विविधता|आनुवंशिकी)",
     "Principles of Inheritance and Variation Class 12 Playlist",
     "Principles of Inheritance and Variation Class 12 One Shot Board",
     "Principles of Inheritance Class 12 Biology NCERT Wallah Sourabh Raina"),
    (34, "Class 12 Biology", "Genetics & Evolution", "Class 12", "Very High",
     "Molecular Basis of Inheritance",
     r"(molecular\s+basis\s+of\s+inheritance|\bdna\b\s+replication|transcription|translation|lac\s+operon|वंशागति\s*के\s*आणविक\s*आधार)",
     "Molecular Basis of Inheritance Class 12 Playlist",
     "Molecular Basis of Inheritance Class 12 One Shot Board",
     "Molecular Basis of Inheritance Class 12 Biology NCERT Wallah"),
    (35, "Class 12 Biology", "Evolution & Human Welfare", "Class 12", "Very High",
     "Evolution & Human Health and Disease",
     r"(\bevolution\b|hardy[\s-]*weinberg|human\s+health\s*(?:and|&)\s*disease|immunity|\baids\b|विकास|मानव\s*स्वास्थ्य\s*तथा\s*रोग)",
     "Evolution Human Health and Disease Class 12 Playlist",
     "Human Health and Disease Evolution Class 12 One Shot Board",
     "Human Health and Disease Class 12 Biology Board One Shot"),
    (36, "Class 12 Biology", "Human Welfare", "Class 12", "Medium",
     "Microbes in Human Welfare",
     r"(microbes?\s+in\s+human\s+welfare|sewage\s+treatment|biogas|मानव\s*कल्याण\s*में\s*सूक्ष्मजीव)",
     "Microbes in Human Welfare Class 12 Biology Playlist",
     "Microbes in Human Welfare Class 12 One Shot Board",
     "Microbes in Human Welfare Class 12 NCERT Wallah Sourabh Raina"),
    (37, "Class 12 Biology", "Biotechnology", "Class 12", "Very High",
     "Biotechnology: Principles, Processes & Applications",
     r"(biotechnology|recombinant\s+dna|\bpcr\b|restriction\s+enzyme|bt\s+cotton|जैव\s*प्रौद्योगिकी)",
     "Biotechnology Principles and Processes Class 12 Playlist",
     "Biotechnology Principles Processes and Applications Class 12 One Shot",
     "Biotechnology Class 12 Biology Board One Shot"),
    (38, "Class 12 Biology", "Ecology & Board PYQs", "Class 12", "High",
     "Organisms, Populations, Ecosystem & Biodiversity",
     r"(organisms?\s*(?:and|&)\s*populations?|\becosystem\b|biodiversity|ecology|complete\s+class\s*12\s+biology|biology\s+sample\s+paper|पारिस्थितिकी|जैव\s*विविधता)",
     "Organisms and Populations Ecosystem Biodiversity Class 12 Playlist",
     "Organisms Populations Ecosystem Biodiversity Class 12 One Shot",
     "Complete Class 12 Biology Marathon PYQ Sample Paper Board"),

    # ============ 5. CLASS 10 SCIENCE (Ch 39–46) ============
    (39, "Class 10 Science", "Class 10 Chemistry", "Class 10", "Very High",
     "Chemical Reactions, Acids, Bases, Salts & Metals",
     r"(chemical\s+reactions?\s*(?:and|&)\s*equations?|acids?[,\s]+bases?\s*(?:and|&)\s*salts?|metals?\s*(?:and|&)\s*non[\s-]*metals?|रासायनिक\s*अभिक्रिया|अम्ल\s*क्षारक|धातु\s*एवं\s*अधातु)",
     "Chemical Reactions Acids Bases Metals Class 10 Science Playlist",
     "Chemical Reactions and Equations Acids Bases Salts Class 10 One Shot",
     "Metals and Non Metals Class 10 Science Prashant Kirad Ashu Sir PW Foundation"),
    (40, "Class 10 Science", "Class 10 Chemistry", "Class 10", "Very High",
     "Carbon & Its Compounds",
     r"(carbon\s*(?:and|&)\s*its\s+compounds?|homologous\s+series|soap\s*(?:and|&)\s*detergent|कार्बन\s*एवं\s*उसके\s*यौगिक)",
     "Carbon and its Compounds Class 10 Science Playlist",
     "Carbon and its Compounds Class 10 One Shot",
     "Carbon and its Compounds Class 10 Prashant Kirad Ashu Sir PW Foundation"),
    (41, "Class 10 Science", "Class 10 Biology", "Class 10", "Very High",
     "Life Processes (Nutrition, Respiration, Circulation, Excretion)",
     r"(life\s+processes|nutrition|human\s+heart|nephron|जैव\s*प्रक्रम)",
     "Life Processes Class 10 Science Playlist",
     "Life Processes Class 10 Science Full Chapter One Shot",
     "Life Processes Class 10 Prashant Kirad Ashu Sir PW Udaan Next Toppers"),
    (42, "Class 10 Science", "Class 10 Biology", "Class 10", "Very High",
     "Control & Coordination and How Do Organisms Reproduce",
     r"(control\s*(?:and|&)\s*coordination|how\s+do\s+organisms?\s+reproduce|reproduction\s+class\s*10|नियंत्रण\s*एवं\s*समन्वय|जीव\s*जनन\s*कैसे)",
     "Control and Coordination How do Organisms Reproduce Class 10 Playlist",
     "Control and Coordination How do Organisms Reproduce Class 10 One Shot",
     "How do Organisms Reproduce Class 10 Prashant Kirad Ashu Sir PW Foundation"),
    (43, "Class 10 Science", "Class 10 Biology", "Class 10", "High",
     "Heredity & Our Environment",
     r"(heredity|our\s+environment|food\s+chain|ozone\s+layer|आनुवंशिकता|हमारा\s*पर्यावरण)",
     "Heredity and Our Environment Class 10 Science Playlist",
     "Heredity Our Environment Class 10 Science One Shot",
     "Heredity Class 10 Science Prashant Kirad Ashu Sir PW Foundation"),
    (44, "Class 10 Science", "Class 10 Physics", "Class 10", "Very High",
     "Light: Reflection, Refraction & The Human Eye",
     r"(light[\s:-]*reflection|reflection\s*(?:and|&)\s*refraction|human\s+eye\s*(?:and|&)?\s*(?:the\s+)?colourful\s+world|प्रकाश\s*परावर्तन|मानव\s*नेत्र)",
     "Light Reflection and Refraction Human Eye Class 10 Playlist",
     "Light Reflection and Refraction Class 10 One Shot",
     "Human Eye and Colourful World Light Class 10 Prashant Kirad Ashu Sir"),
    (45, "Class 10 Science", "Class 10 Physics", "Class 10", "Very High",
     "Electricity & Magnetic Effects of Electric Current",
     r"(\belectricity\b\s+class\s*10|class\s*10.*\belectricity\b|magnetic\s+effects?\s+of\s+(?:electric\s+)?current|domestic\s+electric|विद्युत\s*कक्षा\s*10|विद्युत\s*धारा\s*के\s*चुंबकीय\s*प्रभाव)",
     "Electricity Magnetic Effects of Electric Current Class 10 Playlist",
     "Electricity Class 10 Science One Shot",
     "Magnetic Effects of Electric Current Class 10 Prashant Kirad Ashu Sir PW"),
    (46, "Class 10 Science", "Board Marathons & PYQs", "Class 10", "Very High",
     "Class 10 Science Full-Syllabus Marathons, SSLC & Sample Papers",
     r"(complete\s+class\s*10\s+science|class\s*10\s+science\s+(?:marathon|one\s*shot|sample\s+paper|pyq\w*|full\s+syllabus|model\s+paper)|sslc\s+(?:science|physics|chemistry|biology)|madhyamik\s+(?:physical\s+science|life\s+science)|10th\s+science\s+public\s+exam)",
     "Class 10 Science Sample Paper PYQ Marathon Playlist",
     "Complete Class 10 Science Marathon Full Syllabus One Shot",
     "Class 10 Science Sample Paper Most Important Questions Prashant Kirad Ashu Sir"),

    # ============ 6. CLASS 10 MATHS (Ch 47–54) ============
    (47, "Class 10 Maths", "Number Systems & Algebra", "Class 10", "Very High",
     "Real Numbers, Polynomials & Pair of Linear Equations",
     r"(real\s+numbers?|polynomials?\s+class\s*10|class\s*10.*polynomials?|pair\s+of\s+linear\s+equations?|linear\s+equations?\s+in\s+two\s+variables|वास्तविक\s*संख्या|बहुपद|दो\s*चर\s*वाले\s*रैखिक)",
     "Real Numbers Polynomials Linear Equations Class 10 Maths Playlist",
     "Real Numbers Polynomials Pair of Linear Equations Class 10 One Shot",
     "Pair of Linear Equations Class 10 Shobhit Nirwan Ritik Mishra Dear Sir"),
    (48, "Class 10 Maths", "Algebra", "Class 10", "Very High",
     "Quadratic Equations & Arithmetic Progressions (AP)",
     r"(quadratic\s+equations?|arithmetic\s+progressions?|\ba\.?p\.?\b\s+class\s*10|द्विघात\s*समीकरण|समांतर\s*श्रेढ़ी)",
     "Quadratic Equations Arithmetic Progressions Class 10 Playlist",
     "Quadratic Equations and Arithmetic Progressions Class 10 One Shot",
     "Arithmetic Progressions Quadratic Equations Class 10 Shobhit Nirwan Ritik Sir"),
    (49, "Class 10 Maths", "Geometry & Coordinate", "Class 10", "Very High",
     "Triangles & Coordinate Geometry",
     r"(\btriangles?\b\s+class\s*10|class\s*10.*\btriangles?\b|basic\s+proportionality|\bbpt\b|thales|coordinate\s+geometry\s+class\s*10|class\s*10.*coordinate\s+geometry|त्रिभुज|निर्देशांक\s*ज्यामिति)",
     "Triangles Coordinate Geometry Class 10 Maths Playlist",
     "Triangles and Coordinate Geometry Class 10 Maths One Shot",
     "Triangles Class 10 Maths Shobhit Nirwan Ritik Mishra Dear Sir PW"),
    (50, "Class 10 Maths", "Trigonometry", "Class 10", "Very High",
     "Introduction to Trigonometry & Heights and Distances",
     r"(introduction\s+to\s+trigonometry|trigonometry\s+class\s*10|class\s*10.*trigonometry|applications?\s+of\s+trigonometry|heights?\s*(?:and|&)\s*distances?|त्रिकोणमिति)",
     "Introduction to Trigonometry Class 10 Maths Playlist",
     "Introduction to Trigonometry Some Applications Class 10 One Shot",
     "Trigonometry Class 10 Shobhit Nirwan Ritik Mishra Dear Sir"),
    (51, "Class 10 Maths", "Circles", "Class 10", "High",
     "Circles & Areas Related to Circles",
     r"(\bcircles?\b\s+class\s*10|class\s*10.*\bcircles?\b|areas?\s+related\s+to\s+circles?|वृत्त|वृत्तों\s*से\s*संबंधित\s*क्षेत्रफल)",
     "Circles Areas Related to Circles Class 10 Maths Playlist",
     "Circles and Areas Related to Circles Class 10 One Shot",
     "Circles Class 10 Maths Shobhit Nirwan Ritik Mishra PW Foundation"),
    (52, "Class 10 Maths", "Mensuration", "Class 10", "High",
     "Surface Areas & Volumes",
     r"(surface\s+areas?\s*(?:and|&)\s*volumes?|पृष्ठीय\s*क्षेत्रफल\s*(?:और|एवं)\s*आयतन)",
     "Surface Areas and Volumes Class 10 Maths Playlist",
     "Surface Areas and Volumes Class 10 Maths One Shot",
     "Surface Areas and Volumes Class 10 Shobhit Nirwan Ritik Mishra Dear Sir"),
    (53, "Class 10 Maths", "Statistics & Probability", "Class 10", "Very High",
     "Statistics & Probability",
     r"(\bstatistics\b|mean\s+median\s+mode|probability\s+class\s*10|class\s*10.*probability|सांख्यिकी|प्रायिकता\s*कक्षा\s*10)",
     "Statistics and Probability Class 10 Maths Playlist",
     "Statistics and Probability Class 10 Maths One Shot",
     "Statistics Class 10 Maths Shobhit Nirwan Ritik Mishra Dear Sir"),
    (54, "Class 10 Maths", "Board Marathons & PYQs", "Class 10", "Very High",
     "Class 10 Maths Formulas, PYQs & Board Sample Papers",
     r"(complete\s+class\s*10\s+maths?|class\s*10\s+maths?\s+(?:marathon|one\s*shot|sample\s+paper|pyq\w*|all\s+formulas?|standard|basic)|sslc\s+maths?|madhyamik\s+math\w*|10th\s+maths?\s+public\s+exam)",
     "Class 10 Maths Sample Paper PYQ Marathon Playlist",
     "Complete Class 10 Maths Marathon All Formulas One Shot",
     "Class 10 Maths Sample Paper Most Important Questions Shobhit Nirwan Ritik Sir"),
]

REGIONAL_BOARD_SWEEPS: list[tuple[str, str, str]] = [
    # Class 12 Regional & CBSE/ISC Sweeps (subject, query, sp)
    ("Class 12 Physics", "Arvind Academy Class 12 Physics One Shot", SP_LONG_VIDEOS),
    ("Class 12 Physics", "Abhishek Sahu Class 12 Physics One Shot", SP_LONG_VIDEOS),
    ("Class 12 Physics", "Physics Gyaan Mukesh Nayak HSC Class 12 Physics One Shot", SP_LONG_VIDEOS),
    ("Class 12 Physics", "Xylem Plus Two Physics Marathon One Shot", SP_LONG_VIDEOS),
    ("Class 12 Physics", "Eduport Plus Two Physics Revision", SP_LONG_VIDEOS),
    ("Class 12 Physics", "Hundred Learning 12th Physics Tamil Public Exam", SP_LONG_VIDEOS),
    ("Class 12 Physics", "SimplifiedMinds 2nd PUC Physics Important Questions", SP_LONG_VIDEOS),
    ("Class 12 Physics", "SOE Bangla Class 12 Physics HS Suggestion", SP_LONG_VIDEOS),
    ("Class 12 Physics", "PW Gujarat Class 12 Physics Gujarati One Shot", SP_LONG_VIDEOS),
    ("Class 12 Physics", "PW Odisha CHSE Class 12 Physics Marathon", SP_LONG_VIDEOS),
    ("Class 12 Physics", "PW Telangana Inter 2nd Year Physics IPE", SP_LONG_VIDEOS),
    ("Class 12 Physics", "Science Sangrah Bihar Board Class 12 Physics Hindi", SP_LONG_VIDEOS),
    ("Class 12 Physics", "PW Punjab Board Class 12 Physics", SP_LONG_VIDEOS),

    ("Class 12 Chemistry", "Bharat Panchal Chemistry Guruji Class 12 One Shot", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "Sourabh Raina Class 12 Chemistry PYQ One Shot", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "All About Chemistry Sovind Sir Class 12 HSC One Shot", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "BongMistry Class 12 Chemistry HS Bangla One Shot", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "Xylem Plus Two Chemistry Marathon Malayalam", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "Hundred Learning 12th Chemistry Tamil One Shot", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "SimplifiedMinds 2nd PUC Chemistry One Shot", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "Chemistry By NIMESHSIR Std 12 Gujarati Board", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "PW Odisha CHSE Class 12 Chemistry One Shot", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "Vedantu Telugu Inter 2nd Year Chemistry IPE", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "Anu Sir Science Sangrah Class 12 Chemistry Hindi", SP_LONG_VIDEOS),

    ("Class 12 Maths", "Anurag Chauhan Class 12 Maths One Shot CBSE", SP_LONG_VIDEOS),
    ("Class 12 Maths", "Neha Agrawal Mathematically Inclined Class 12 CBSE Board", SP_LONG_VIDEOS),
    ("Class 12 Maths", "Dinesh Sir Live Study Class 12 Maths HSC Mahamarathon", SP_LONG_VIDEOS),
    ("Class 12 Maths", "AlexMaths 12th Maths Tamil Chapter Playlist", SP_PLAYLIST_ONLY),
    ("Class 12 Maths", "Xylem Plus Two Maths Revision Malayalam", SP_LONG_VIDEOS),
    ("Class 12 Maths", "SimplifiedMinds 2nd PUC Maths Passing Package One Shot", SP_LONG_VIDEOS),
    ("Class 12 Maths", "SOE Bangla Class 12 Maths HS Bangla", SP_LONG_VIDEOS),
    ("Class 12 Maths", "PW Gujarat Std 12 Maths Gujarati One Shot", SP_LONG_VIDEOS),
    ("Class 12 Maths", "PW Odisha CHSE Class 12 Maths One Shot", SP_LONG_VIDEOS),
    ("Class 12 Maths", "Kiran Sir Vedantu Telugu Inter 2nd Year Maths 2A 2B", SP_LONG_VIDEOS),

    ("Class 12 Biology", "Sourabh Raina Class 12 Biology One Shot CBSE", SP_LONG_VIDEOS),
    ("Class 12 Biology", "NCERT Wallah Class 12 Biology Vijeta One Shot", SP_LONG_VIDEOS),
    ("Class 12 Biology", "New Indian Era Class 12 Biology HSC Maharashtra", SP_LONG_VIDEOS),
    ("Class 12 Biology", "Biology Simplified Tamil Class 12 Botany Zoology", SP_LONG_VIDEOS),
    ("Class 12 Biology", "Xylem Plus Two Biology Marathon Malayalam", SP_LONG_VIDEOS),
    ("Class 12 Biology", "SimplifiedMinds 2nd PUC Biology Karnataka", SP_LONG_VIDEOS),
    ("Class 12 Biology", "PW Bangla Class 12 Biology HS One Shot", SP_LONG_VIDEOS),
    ("Class 12 Biology", "PW Gujarat Std 12 Biology Gujarati One Shot", SP_LONG_VIDEOS),
    ("Class 12 Biology", "PW Odisha CHSE Class 12 Biology One Shot", SP_LONG_VIDEOS),
    ("Class 12 Biology", "Vedantu Telugu Inter Botany Zoology IPE", SP_LONG_VIDEOS),

    # Class 10 All-India CBSE, ICSE & State Board Sweeps
    ("Class 10 Science", "Prashant Kirad Exphub Class 10 Science One Shot", SP_LONG_VIDEOS),
    ("Class 10 Science", "Science and Fun Ashu Sir Class 10 Science One Shot", SP_LONG_VIDEOS),
    ("Class 10 Science", "PW Foundation Udaan Class 10 Science One Shot", SP_LONG_VIDEOS),
    ("Class 10 Science", "Vedantu 9 and 10 Class 10 Science Marathon", SP_LONG_VIDEOS),
    ("Class 10 Science", "Xylem SSLC Physics Chemistry Biology Malayalam Marathon", SP_LONG_VIDEOS),
    ("Class 10 Science", "Eduport SSLC Science Revision Malayalam", SP_LONG_VIDEOS),
    ("Class 10 Science", "Hundred Learning 10th Science Tamil Public Exam", SP_LONG_VIDEOS),
    ("Class 10 Science", "Parth Momaya Class 10 Science SSC Maharashtra One Shot", SP_LONG_VIDEOS),
    ("Class 10 Science", "Parikshe SSLC Science Kannada Karnataka One Shot", SP_LONG_VIDEOS),
    ("Class 10 Science", "PW Bangla Madhyamik Physical Science Life Science", SP_LONG_VIDEOS),
    ("Class 10 Science", "Diwalipura Youth Youth Education Std 10 Science Gujarati", SP_LONG_VIDEOS),
    ("Class 10 Science", "PW Telugu 10th Class Physical Science Biology", SP_LONG_VIDEOS),
    ("Class 10 Science", "Dear Ramesh Sir RKD Classes 10th Science Odia", SP_LONG_VIDEOS),
    ("Class 10 Science", "Disha Online Classes Target Board Class 10 Science Bihar Board", SP_LONG_VIDEOS),
    ("Class 10 Science", "UP Board High School Vidyakul Class 10 Science Hindi", SP_LONG_VIDEOS),
    ("Class 10 Science", "PW Punjab Board Class 10 Science Punjabi", SP_LONG_VIDEOS),

    ("Class 10 Maths", "Shobhit Nirwan Next Toppers Class 10 Maths One Shot", SP_LONG_VIDEOS),
    ("Class 10 Maths", "Ritik Mishra PW Foundation Class 10 Maths One Shot", SP_LONG_VIDEOS),
    ("Class 10 Maths", "Dear Sir Class 10 Maths Full Chapter", SP_LONG_VIDEOS),
    ("Class 10 Maths", "Green Board Class 10 Maths Playlist", SP_PLAYLIST_ONLY),
    ("Class 10 Maths", "Galaxy of Maths Dinesh Sir Class 10 Maths SSC Marathi", SP_LONG_VIDEOS),
    ("Class 10 Maths", "Xylem SSLC Maths Marathon Malayalam", SP_LONG_VIDEOS),
    ("Class 10 Maths", "AlexMaths 10th Maths Tamil Samacheer", SP_PLAYLIST_ONLY),
    ("Class 10 Maths", "Hundred Learning 10th Maths Tamil One Shot", SP_LONG_VIDEOS),
    ("Class 10 Maths", "Parikshe SSLC Maths Kannada Karnataka", SP_LONG_VIDEOS),
    ("Class 10 Maths", "PW Bangla Madhyamik Mathematics One Shot", SP_LONG_VIDEOS),
    ("Class 10 Maths", "Youth Education Vidyakul Gujarati Std 10 Maths", SP_LONG_VIDEOS),
    ("Class 10 Maths", "PW Telugu 10th Class Maths Public Exam", SP_LONG_VIDEOS),
    ("Class 10 Maths", "Dear Ramesh Sir 10th Class Geometry Algebra Odia", SP_LONG_VIDEOS),
    ("Class 10 Maths", "Disha Online Classes Pankaj Study Centre Class 10 Maths Hindi", SP_LONG_VIDEOS),
    ("Class 10 Maths", "PSEB Class 10 Maths Punjabi Medium One Shot", SP_LONG_VIDEOS),
    ("Class 12 Maths", "PSEB Class 12 Maths Punjabi Medium", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "PSEB Class 12 Chemistry Punjabi", SP_LONG_VIDEOS),
    ("Class 12 Biology", "PSEB Class 12 Biology Punjabi", SP_LONG_VIDEOS),
    # ICSE Class 10 & ISC Class 12 Sweeps
    ("Class 10 Science", "Amplify Learning ICSE Class 10 Physics Chemistry Biology One Shot", SP_LONG_VIDEOS),
    ("Class 10 Science", "Sir Tarun Rupani ICSE Class 10 Physics Chemistry Biology One Shot", SP_LONG_VIDEOS),
    ("Class 10 Maths", "Sir Tarun Rupani Amplify Learning ICSE Class 10 Maths One Shot", SP_LONG_VIDEOS),
    ("Class 12 Physics", "Yash Maheshwari ISC Class 12 Physics One Shot", SP_LONG_VIDEOS),
    ("Class 12 Chemistry", "Yash Maheshwari Bharat Panchal ISC Class 12 Chemistry One Shot", SP_LONG_VIDEOS),
    ("Class 12 Maths", "Yash Maheshwari Neha Agrawal ISC Class 12 Maths One Shot", SP_LONG_VIDEOS),
]

VERIFIED_BOARD_CHANNEL_PATTERNS = (
    # National CBSE / ISC / NCERT Channels
    "ncert wallah", "pw foundation", "udaan", "physics wallah", "vijeta",
    "pw class 11", "pw english", "science and fun", "ashu ghai", "ashu sir",
    "next toppers", "exphub", "prashant kirad", "shobhit nirwan",
    "bharat panchal", "chemistry guruji", "sourabh raina", "arvind academy",
    "abhishek sahu", "radhika classes", "munil sir", "sunil jangra", "sachin sir physics",
    "anurag chauhan", "neha agrawal", "mathematically inclined", "cbseclass videos",
    "dear sir", "green board", "mkr class", "edumantra", "eduhap", "padhle",
    "learnohub", "magnet brains", "vedantu", "unacademy", "byju", "aakash", "allen",
    "amplify learning", "sir tarun rupani", "clarify knowledge", "yash maheshwari", "cisce", "icse wallah",
    # Hindi Belt State Boards (BSEB Bihar, UPMSP, RBSE, MP Board)
    "science sangrah", "anu sir", "disha online", "target board", "pankaj study",
    "ask class", "dls education", "vidyakul", "jay mahadev", "up board wallah",
    "bihar board wallah", "ashish singh", "learn and share", "gyansindhu",
    "utkarsh", "doubtnut", "shubham classes", "xpclasses", "rwa tuition",
    # Maharashtra HSC & SSC (Marathi / English)
    "dinesh sir", "mukesh nayak", "physics gyaan", "sovind sir", "all about chemistry",
    "new indian era", "prashant tiwari", "parth momaya", "galaxy of maths",
    "pawan wagh", "giri tutorials", "sahyadri tutorials", "pw maharashtra", "pw mht cet",
    # Kerala Plus Two & SSLC (Malayalam)
    "xylem", "eduport", "exam winner", "brilliant pala", "pw malayalam", "scert",
    # Tamil Nadu 12th & 10th Samacheer (Tamil)
    "hundred learning", "alexmaths", "alex maths", "biology simplified tamil",
    "pw tamil", "kalvi", "ramanan", "muruga mp", "open your mind with muruga",
    # Andhra Pradesh & Telangana IPE / 10th (Telugu)
    "pw telangana", "pw telugu", "kiran sir", "vedantu telugu", "unacademy telugu",
    "prathibha", "rk tutorial", "anjaneyulu",
    # Karnataka 2nd PUC & SSLC (Kannada / English)
    "simplifiedminds", "parikshe", "educare", "pw kannada", "pw kcet",
    # West Bengal WBCHSE HS & Madhyamik (Bengali)
    "bongmistry", "soe bangla", "pw bangla", "science beta", "samrat exclusive",
    "friendly learning", "physics dada",
    # Gujarat GSEB Std 10 & 12 (Gujarati)
    "pw gujarat", "nimeshsir", "nimesh sir", "youth education", "diwalipura youth",
    "katira classes", "priyeshsir",
    # Odisha CHSE & BSE 10th (Odia)
    "pw odisha", "chse catalyst", "dear ramesh sir", "rkd classes", "matsci",
    # Punjab PSEB (Punjabi)
    "pw punjab", "punjab board", "pseb", "punjab",
)

HARD_REJECT_RE = re.compile(
    r"\b(vlog\w*|prank|controversy|exposed|roast|reaction\s+video|"
    r"cutoff\w*|cut[\s-]*off\w*|counselling|josaa|college\s+review|hostel\s+tour|"
    r"admit\s+card|result\s+(?:out|declared|date)|date\s*sheet\s+out|time\s+table\s+released|"
    r"copy\s+checking|grace\s+marks|paper\s+leak|"
    r"ssc\s+cgl|ssc\s+chsl|railway\s+ntpc|upsc|nda\s+exam|banking\s+exam|"
    r"class\s*[678]\b|std\s*[678]\b|jee\s+advanced\s+\d{4}|irodov|pathfinder|"
    r"shorts|#shorts|#ytshorts)\b",
    re.I,
)


def parse_views(text: str) -> int:
    if not text:
        return 0
    cleaned = text.lower().replace(",", "").strip()
    m = re.search(r"([\d.]+)\s*([kmb]|lakh|cr)?", cleaned)
    if not m:
        return 0
    val = float(m.group(1))
    mult = m.group(2) or ""
    if mult == "k":
        val *= 1_000
    elif mult == "m":
        val *= 1_000_000
    elif mult == "b":
        val *= 1_000_000_000
    elif mult == "lakh":
        val *= 100_000
    elif mult == "cr":
        val *= 10_000_000
    return int(val)


def parse_duration_seconds(text: str) -> int:
    if not text:
        return 0
    parts = [int(p) for p in re.findall(r"\d+", text)]
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    if len(parts) == 1:
        return parts[0]
    return 0


def parse_lesson_count(text: str) -> int:
    if not text:
        return 0
    m = re.search(r"(\d+)", text.replace(",", ""))
    return int(m.group(1)) if m else 0


def search_youtube(query: str, params: str = "", use_cache: bool = True) -> dict:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_id = f"{query}::sp={params}" if params else query
    key = hashlib.sha1(cache_id.encode("utf-8")).hexdigest()
    fname = f"{key}.json"
    if use_cache:
        for cdir in SIBLING_CACHES:
            cpath = cdir / fname
            if cpath.exists():
                with _lock:
                    STATS["cached"] += 1
                return json.loads(cpath.read_text(encoding="utf-8"))

    body: dict = {
        "context": {
            "client": {
                "clientName": "WEB",
                "clientVersion": "2.20250101.00.00",
                "hl": "en",
                "gl": "IN",
            }
        },
        "query": query,
    }
    if params:
        body["params"] = params
    payload = json.dumps(body).encode("utf-8")

    last_err = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(
                INNERTUBE_SEARCH,
                data=payload,
                headers={"User-Agent": UA, "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as resp:
                data = json.load(resp)
            with _lock:
                STATS["requests"] += 1
            (CACHE_DIR / fname).write_text(json.dumps(data), encoding="utf-8")
            return data
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            time.sleep(0.6 * (attempt + 1))
    print(f"WARN: search failed for {query!r}: {last_err}", flush=True)
    return {}


def extract_candidates(payload: dict) -> list[dict]:
    items = []
    try:
        sections = (
            payload["contents"]["twoColumnSearchResultsRenderer"]["primaryContents"]
            ["sectionListRenderer"]["contents"]
        )
    except (KeyError, TypeError):
        return items

    for sec in sections:
        contents = sec.get("itemSectionRenderer", {}).get("contents", [])
        for entry in contents:
            if "lockupViewModel" in entry:
                parsed = _parse_lockup(entry["lockupViewModel"])
                if parsed:
                    items.append(parsed)
            elif "playlistRenderer" in entry:
                parsed = _parse_legacy_playlist(entry["playlistRenderer"])
                if parsed:
                    items.append(parsed)
            elif "videoRenderer" in entry:
                parsed = _parse_video(entry["videoRenderer"])
                if parsed:
                    items.append(parsed)
    return items


def _parse_lockup(lv: dict) -> dict | None:
    cid = (lv.get("contentId") or "").strip()
    ctype = lv.get("contentType") or ""
    if not cid or ("PLAYLIST" not in ctype and "COURSE" not in ctype and not cid.startswith("PL")):
        return None
    if cid.startswith("RD"):
        return None
    meta_vm = lv.get("metadata", {}).get("lockupMetadataViewModel", {})
    title = (meta_vm.get("title", {}).get("content") or "").strip()
    if not title:
        return None
    rows = meta_vm.get("metadata", {}).get("contentMetadataViewModel", {}).get("metadataRows", [])
    channel = ""
    channel_url = ""
    sample_lectures: list[dict] = []
    for row in rows:
        for part in row.get("metadataParts") or []:
            txt_obj = part.get("text") or {}
            content = (txt_obj.get("content") or "").strip()
            if not content or content.lower() in {"playlist", "course", "view full playlist", "view full course", "podcast"}:
                continue
            cmd_runs = txt_obj.get("commandRuns") or []
            web_url = ""
            watch_vid = ""
            if cmd_runs:
                icmd = cmd_runs[0].get("onTap", {}).get("innertubeCommand", {})
                web_url = icmd.get("commandMetadata", {}).get("webCommandMetadata", {}).get("url") or ""
                watch_vid = icmd.get("watchEndpoint", {}).get("videoId") or ""
            if not channel and (web_url.startswith("/@") or web_url.startswith("/channel/") or web_url.startswith("/c/")):
                channel = content
                channel_url = f"https://www.youtube.com{web_url}"
            elif watch_vid and len(sample_lectures) < 4:
                sample_lectures.append(
                    {
                        "video_id": watch_vid,
                        "title": content,
                        "url": f"https://www.youtube.com/watch?v={watch_vid}&list={cid}",
                    }
                )
    if not channel and rows:
        fp = rows[0].get("metadataParts") or []
        if fp:
            channel = (fp[0].get("text", {}).get("content") or "").strip()
    thumb_vm = (
        lv.get("contentImage", {})
        .get("collectionThumbnailViewModel", {})
        .get("primaryThumbnail", {})
        .get("thumbnailViewModel", {})
    )
    sources = thumb_vm.get("image", {}).get("sources") or []
    thumbnail = sources[-1]["url"] if sources else ""
    lesson_count = 0
    for ov in thumb_vm.get("overlays") or []:
        for b in ov.get("thumbnailOverlayBadgeViewModel", {}).get("thumbnailBadges") or []:
            cnt = parse_lesson_count(b.get("thumbnailBadgeViewModel", {}).get("text") or "")
            if cnt:
                lesson_count = cnt
                break
    embed_vid = sample_lectures[0]["video_id"] if sample_lectures else ""
    if not embed_vid and thumbnail:
        m = re.search(r"/vi/([A-Za-z0-9_-]{11})/", thumbnail)
        if m:
            embed_vid = m.group(1)
    return {
        "provider": "playlist",
        "video_id": cid,
        "embed_video_id": embed_vid,
        "url": f"https://www.youtube.com/playlist?list={cid}",
        "title": title,
        "channel": channel or "Board Faculty",
        "channel_url": channel_url,
        "thumbnail": thumbnail,
        "lesson_count": lesson_count,
        "duration": "",
        "duration_sec": 0,
        "views_text": "",
        "view_count": 0,
        "published": "",
        "sample_lectures": sample_lectures,
    }


def _parse_legacy_playlist(pr: dict) -> dict | None:
    cid = (pr.get("playlistId") or "").strip()
    title = (pr.get("title", {}).get("simpleText") or "").strip()
    if not cid or not title or cid.startswith("RD"):
        return None
    runs = pr.get("shortBylineText", {}).get("runs") or pr.get("longBylineText", {}).get("runs") or []
    channel = (runs[0].get("text") if runs else "").strip() or "Board Faculty"
    thumbs = pr.get("thumbnails", [{}])[0].get("thumbnails") or []
    thumbnail = thumbs[-1].get("url", "") if thumbs else ""
    embed_vid = ""
    if thumbnail:
        m = re.search(r"/vi/([A-Za-z0-9_-]{11})/", thumbnail)
        if m:
            embed_vid = m.group(1)
    return {
        "provider": "playlist",
        "video_id": cid,
        "embed_video_id": embed_vid,
        "url": f"https://www.youtube.com/playlist?list={cid}",
        "title": title,
        "channel": channel,
        "channel_url": "",
        "thumbnail": thumbnail,
        "lesson_count": parse_lesson_count(pr.get("videoCount") or ""),
        "duration": "",
        "duration_sec": 0,
        "views_text": "",
        "view_count": 0,
        "published": "",
        "sample_lectures": [],
    }


def _parse_video(vr: dict) -> dict | None:
    vid = (vr.get("videoId") or "").strip()
    runs = vr.get("title", {}).get("runs") or []
    title = "".join(r.get("text", "") for r in runs).strip()
    if not vid or not title or len(vid) != 11:
        return None
    owner_runs = vr.get("ownerText", {}).get("runs") or vr.get("longBylineText", {}).get("runs") or []
    channel = (owner_runs[0].get("text") if owner_runs else "").strip() or "Board Faculty"
    channel_url = ""
    if owner_runs:
        wurl = (
            owner_runs[0]
            .get("navigationEndpoint", {})
            .get("commandMetadata", {})
            .get("webCommandMetadata", {})
            .get("url")
            or ""
        )
        if wurl:
            channel_url = f"https://www.youtube.com{wurl}"
    length_text = (vr.get("lengthText", {}).get("simpleText") or "").strip()
    dur_sec = parse_duration_seconds(length_text)
    views_text = (vr.get("viewCountText", {}).get("simpleText") or "").strip()
    view_count = parse_views(views_text)
    published = (vr.get("publishedTimeText", {}).get("simpleText") or "").strip()
    thumbs = vr.get("thumbnail", {}).get("thumbnails") or []
    thumbnail = thumbs[-1].get("url", "") if thumbs else f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
    return {
        "provider": "youtube",
        "video_id": vid,
        "embed_video_id": vid,
        "url": f"https://www.youtube.com/watch?v={vid}",
        "title": title,
        "channel": channel,
        "channel_url": channel_url,
        "thumbnail": thumbnail,
        "lesson_count": 0,
        "duration": length_text,
        "duration_sec": dur_sec,
        "views_text": views_text,
        "view_count": view_count,
        "published": published,
        "sample_lectures": [],
    }


def is_verified_board_channel(channel: str) -> bool:
    low = channel.strip().casefold()
    if not low:
        return False
    if re.search(r"\b(upsc|ssc\s+cgl|bank|ias|clat|gate|ugc\s+net)\b", low):
        return False
    return any(p in low for p in VERIFIED_BOARD_CHANNEL_PATTERNS)


def resolve_language(cand: dict) -> str:
    text = f"{cand['title']} {cand['channel']}"
    low = text.lower()
    ch_low = cand["channel"].lower()

    # Unicode script checks first
    if re.search(r"[\u0b80-\u0bff]", text) or any(k in low for k in ("tamil", "samacheer", "hundred learning", "alexmaths", "alex maths", "kalvi", "muruga mp")):
        return "Tamil"
    if re.search(r"[\u0d00-\u0d7f]", text) or any(k in low for k in ("malayalam", "xylem", "eduport", "exam winner", "plus two", "kerala sslc")):
        return "Malayalam"
    if re.search(r"[\u0c00-\u0c7f]", text) or any(k in low for k in ("telugu", "pw telangana", "vedantu telugu", "unacademy telugu", "ap inter", "ts inter")):
        return "Telugu"
    if re.search(r"[\u0c80-\u0cff]", text) or any(k in low for k in ("kannada", "parikshe", "simplifiedminds", "pw kannada", "pw kcet", "karnataka sslc")):
        return "Kannada"
    if re.search(r"[\u0980-\u09ff]", text) or any(k in low for k in ("bangla", "bengali", "bongmistry", "soe bangla", "madhyamik", "wbchse", "science beta", "samrat exclusive")):
        return "Bengali"
    if re.search(r"[\u0a80-\u0aff]", text) or any(k in low for k in ("gujarati", "gseb", "gshseb", "pw gujarat", "nimeshsir", "nimesh sir", "youth education", "diwalipura")):
        return "Gujarati"
    if re.search(r"[\u0b00-\u0b7f]", text) or any(k in low for k in ("odia", "oriya", "pw odisha", "chse catalyst", "dear ramesh sir", "rkd classes", "matsci")):
        return "Odia"
    if re.search(r"[\u0a00-\u0a7f]", text) or any(k in low for k in ("punjabi", "pseb", "pw punjab", "punjab board")):
        return "Punjabi"
    if any(k in low for k in ("marathi", "dinesh sir", "mukesh nayak", "physics gyaan", "sovind sir", "new indian era", "parth momaya", "galaxy of maths", "pawan wagh", "sahyadri", "pw maharashtra", "maharashtra board")):
        return "Marathi"
    if re.search(r"[\u0900-\u097f]", text) or any(
        k in low
        for k in (
            "hindi medium", "science sangrah", "anu sir", "disha online", "target board",
            "pankaj study", "vidyakul", "up board", "bihar board", "ashish singh",
            "learn and share", "gyansindhu", "shubham classes", "doubtnut",
        )
    ):
        return "Hindi"
    if any(k in ch_low for k in ("pw english", "learnohub", "sir tarun rupani", "amplify learning")) or re.search(r"\bin\s+english\b|\benglish\s+medium\b", low):
        return "English"
    return "Hinglish"


def classify_board_stream_and_format(cand: dict, lang: str) -> tuple[str, str]:
    blob = f"{cand['title']} {cand['channel']}".lower()
    if lang == "Marathi" or re.search(r"\b(hsc|maharashtra\s+board|mht|ssc\s+maharashtra)\b", blob):
        stream = "Maharashtra HSC & SSC"
    elif lang in {"Tamil", "Malayalam", "Telugu", "Kannada"} or re.search(r"\b(puc|plus\s+two|samacheer|ipe\b|sslc)\b", blob):
        stream = "South Boards (TN · Kerala · AP/TS · PUC)"
    elif lang in {"Bengali", "Gujarati", "Odia", "Punjabi"} or re.search(r"\b(wbchse|madhyamik|gseb|chse|pseb)\b", blob):
        stream = "East & West Boards (WB · GJ · OD · PB)"
    elif lang == "Hindi" or re.search(r"\b(up\s+board|upmsp|bihar\s+board|bseb|rbse|mp\s+board)\b", blob):
        stream = "Hindi Belt Boards (BSEB · UP · RBSE · MP)"
    elif re.search(r"\b(icse|isc\b)\b", blob):
        stream = "ICSE & ISC Boards"
    else:
        stream = "CBSE & NCERT Boards"

    t_low = cand["title"].lower()
    if cand["provider"] == "playlist":
        fmt = "PYQ & Mock" if re.search(r"\b(pyq\w*|sample\s+paper|previous\s+year|model\s+paper)\b", t_low) else "Full Course"
    else:
        if re.search(r"\b(pyq\w*|sample\s+paper|previous\s+year|model\s+paper|important\s+questions|numericals?)\b", t_low):
            fmt = "PYQ & Mock"
        elif re.search(r"\b(one[\s-]*shot|marathon|mahamarathon|full\s+chapter|complete\s+chapter)\b", t_low) or cand["duration_sec"] >= 3600:
            fmt = "One-Shot"
        else:
            fmt = "Board Lecture"
    return stream, fmt


def resolve_educator_and_institute(cand: dict) -> tuple[str, str]:
    blob = f"{cand['title']} {cand['channel']}".lower()
    rules = [
        (r"prashant kirad|exphub", "Prashant Kirad (Exphub)", "Next Toppers & Exphub"),
        (r"shobhit nirwan", "Shobhit Nirwan", "Next Toppers & Exphub"),
        (r"next toppers", "Next Toppers Faculty", "Next Toppers & Exphub"),
        (r"ashu ghai|ashu sir|science and fun", "Ashu Ghai Sir (Science and Fun)", "Science and Fun"),
        (r"bharat panchal|chemistry guruji", "Bharat Panchal Sir", "CBSE Board Specialists"),
        (r"sourabh raina", "Sourabh Raina Sir", "CBSE Board Specialists"),
        (r"arvind academy", "Arvind Academy", "CBSE Board Specialists"),
        (r"abhishek sahu", "Abhishek Sahu Sir", "CBSE Board Specialists"),
        (r"munil sir", "Munil Sir", "CBSE Board Specialists"),
        (r"radhika classes", "Radhika Classes", "CBSE Board Specialists"),
        (r"anurag chauhan", "Anurag Chauhan Sir", "CBSE Board Specialists"),
        (r"neha agrawal|mathematically inclined", "Neha Agrawal Ma'am", "CBSE Board Specialists"),
        (r"dear sir", "Dear Sir", "Class 10 Board Specialists"),
        (r"green board", "Green Board (Mandeep Sir)", "Class 10 Board Specialists"),
        (r"ritik mishra", "Ritik Mishra Sir (PW)", "Physics Wallah Boards"),
        (r"dinesh sir|galaxy of maths", "Dinesh Sir (Maharashtra)", "Maharashtra HSC & SSC"),
        (r"mukesh nayak|physics gyaan", "Mukesh Nayak Sir (HSC)", "Maharashtra HSC & SSC"),
        (r"sovind sir|all about chemistry", "Sovind Sir (HSC)", "Maharashtra HSC & SSC"),
        (r"new indian era", "Prashant Tiwari (New Indian Era)", "Maharashtra HSC & SSC"),
        (r"parth momaya", "Parth Momaya (SSC)", "Maharashtra HSC & SSC"),
        (r"xylem", "Xylem Learning (Kerala)", "South State Boards"),
        (r"eduport", "Eduport (Kerala)", "South State Boards"),
        (r"exam winner", "Exam Winner (Kerala)", "South State Boards"),
        (r"hundred learning", "Hundred Learning (TN)", "South State Boards"),
        (r"alex\s*maths", "AlexMaths (TN)", "South State Boards"),
        (r"biology simplified tamil", "Senthilnathan Sir (Tamil)", "South State Boards"),
        (r"simplifiedminds", "SimplifiedMinds (Karnataka PUC)", "South State Boards"),
        (r"parikshe", "Parikshe (Karnataka SSLC)", "South State Boards"),
        (r"bongmistry", "NKD Sir (BongMistry Bangla)", "East & West State Boards"),
        (r"soe bangla", "SOE Bangla", "East & West State Boards"),
        (r"nimesh\s*sir", "Nimesh Sir (Gujarat Board)", "East & West State Boards"),
        (r"youth education|diwalipura", "Youth Education (Gujarat)", "East & West State Boards"),
        (r"chse catalyst", "CHSE Catalyst (Odisha)", "East & West State Boards"),
        (r"dear ramesh sir", "Dear Ramesh Sir (Odia)", "East & West State Boards"),
        (r"science sangrah|anu sir", "Anu Sir (Science Sangrah)", "Hindi Medium State Boards"),
        (r"disha online", "Sanjay Sir (Disha Online BSEB)", "Hindi Medium State Boards"),
        (r"target board", "Prince Sir (Target Board BSEB)", "Hindi Medium State Boards"),
        (r"ashish singh", "Ashish Singh Lectures", "Hindi Medium State Boards"),
        (r"learn and share", "Learn and Share", "Hindi Medium State Boards"),
        (r"vidyakul|jay mahadev", "Vidyakul Board Faculty", "Hindi Medium State Boards"),
        (r"ncert wallah|pw foundation|udaan|vijeta|physics wallah|\bpw\b", "PW Board Faculty", "Physics Wallah Boards"),
        (r"vedantu", "Vedantu Board Master Teachers", "Vedantu Boards"),
        (r"sir tarun rupani", "Sir Tarun Rupani (ICSE/ISC)", "ICSE & ISC Specialists"),
    ]
    for pat, edu, inst in rules:
        if re.search(pat, blob):
            return edu, inst
    return cand["channel"], "Board Educators"


def is_valid_board_candidate(cand: dict, ch_no: int, subject: str, class_lvl: str, cre: re.Pattern[str]) -> bool:
    title = cand["title"]
    channel = cand["channel"]
    if not is_verified_board_channel(channel):
        return False
    if HARD_REJECT_RE.search(title):
        return False
    if cand["provider"] == "playlist":
        if cand["lesson_count"] == 1:
            return False
    else:
        if cand["duration_sec"] < MIN_VIDEO_SECONDS:
            return False

    blob = f"{title} {channel}".lower()
    # Strict Class 10 vs Class 12 isolation
    if class_lvl == "Class 12":
        if re.search(r"\b(class\s*(?:9|10|ix|x)\b|10th|sslc|madhyamik|std\s*10|udaan)\b", blob) and not re.search(
            r"\b(class\s*12|12th|plus\s+two|2nd\s+puc|hsc|inter\s*2nd)\b", blob
        ):
            return False
    else:
        if re.search(r"\b(class\s*(?:11|12|xi|xii)\b|12th|plus\s+two|2nd\s+puc|hsc|jee|neet|cuet)\b", blob) and not re.search(
            r"\b(class\s*10|10th|sslc|madhyamik|std\s*10|ssc\s+board)\b", blob
        ):
            return False

    # Subject guard
    if "Physics" in subject and re.search(r"\b(chemistry|biology|botany|zoology|haloalkanes|integrals|matrices)\b", title, re.I):
        return False
    if "Chemistry" in subject and re.search(r"\b(ray\s+optics|semiconductor|integrals|matrices|human\s+reproduction)\b", title, re.I):
        return False
    if "Maths" in subject and re.search(r"\b(physics|chemistry|biology|electrostatics|haloalkanes|life\s+processes)\b", title, re.I):
        return False
    if "Biology" in subject and re.search(r"\b(physics|chemistry|integrals|matrices|electrostatics|semiconductor)\b", title, re.I):
        return False
    if subject == "Class 10 Science" and re.search(r"\b(trigonometry|quadratic\s+equations?|arithmetic\s+progressions?|surface\s+areas?|social\s+science|history|civics)\b", title, re.I):
        return False

    return bool(cre.search(title))


def parse_age_months(published_text: str) -> float:
    if not published_text:
        return 14.0
    low = published_text.lower()
    m = re.search(r"(\d+)\s*(hour|day|week|month|year)", low)
    if not m:
        return 14.0
    n = float(m.group(1))
    unit = m.group(2)
    if unit == "hour":
        return 0.15
    if unit == "day":
        return max(0.2, n / 30.0)
    if unit == "week":
        return max(0.3, (n * 7.0) / 30.0)
    if unit == "month":
        return max(0.5, n)
    if unit == "year":
        return max(12.0, n * 12.0)
    return 14.0


def compute_trend_metrics(cand: dict, fmt: str) -> tuple[float, int, float, str]:
    if cand["provider"] == "playlist":
        lessons = cand["lesson_count"]
        t_score = 64.0 + min(lessons, 45) * 0.42 + (3.5 if cand.get("sample_lectures") else 0.0)
        badge = f"📚 {lessons} Lectures" if lessons else "📚 Full Playlist"
        return 12.0, 0, round(t_score, 2), badge

    views = max(int(cand.get("view_count") or 0), 1)
    age_m = parse_age_months(cand.get("published") or "")
    vpm = int(round(views / max(age_m, 0.75)))
    velocity_pts = math.log10(max(vpm, 1)) * 13.5
    reach_pts = math.log10(views) * 9.5
    freshness_pts = 8.0 if age_m <= 6.0 else (4.5 if age_m <= 14.0 else (2.0 if age_m <= 24.0 else 0.0))
    depth_pts = 3.5 if cand.get("duration_sec", 0) >= 3600 else 1.5
    t_score = round(velocity_pts + reach_pts + freshness_pts + depth_pts, 2)
    if vpm >= 35_000 or (age_m <= 8.0 and views >= 150_000):
        badge = "🔥 Trending"
    elif views >= 1_000_000:
        badge = "⭐ Most Loved"
    elif views >= 250_000 or vpm >= 12_000:
        badge = "📈 Popular"
    else:
        badge = f"⚡ {fmt}"
    return round(age_m, 1), vpm, t_score, badge


def load_sibling_board_candidates() -> list[dict]:
    """Harvest already-verified Class 12 & Class 10 board/regional entries from sibling datasets."""
    harvested = []
    for sib in ("neettube", "jeetube", "upboardtube"):
        p = ROOT.parent / sib / "data" / "videos.json"
        if not p.exists():
            continue
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            continue
        for v in data.get("videos") or []:
            tx = str(v.get("target_exam", "")).lower()
            lg = str(v.get("language", ""))
            # Include all regional-language entries + explicit Class 12/10 Board entries
            if (
                sib == "upboardtube"
                or "board" in tx
                or "class 12" in tx
                or lg not in {"Hinglish", "English"}
            ):
                harvested.append(
                    {
                        "provider": v["provider"],
                        "video_id": v["video_id"],
                        "embed_video_id": v.get("embed_video_id", ""),
                        "url": v["url"],
                        "title": v["title"],
                        "channel": v.get("channel", ""),
                        "channel_url": v.get("channel_url", ""),
                        "thumbnail": v.get("thumbnail", ""),
                        "lesson_count": int(v.get("lesson_count") or 0),
                        "duration": v.get("duration", ""),
                        "duration_sec": int(v.get("duration_sec") or 0),
                        "views_text": v.get("views_text", ""),
                        "view_count": int(v.get("view_count") or 0),
                        "published": v.get("published", ""),
                        "sample_lectures": v.get("sample_lectures") or [],
                        "_preset_lang": lg if lg in {
                            "Hinglish", "English", "Hindi", "Telugu", "Tamil",
                            "Malayalam", "Kannada", "Marathi", "Bengali",
                            "Gujarati", "Odia", "Punjabi"
                        } else "",
                    }
                )
    return harvested


def build_corpus(use_cache: bool = True) -> dict:
    compiled = []
    tasks = []
    for ch_no, subj, unit, cl_lvl, wt, ch_name, pat, pl_q, vq1, vq2 in SYLLABUS:
        cre = re.compile(pat, re.I)
        compiled.append((ch_no, subj, unit, cl_lvl, wt, ch_name, cre))
        tasks.append(("chapter", ch_no, subj, cl_lvl, cre, pl_q, SP_PLAYLIST_ONLY))
        tasks.append(("chapter", ch_no, subj, cl_lvl, cre, vq1, SP_LONG_VIDEOS))
        tasks.append(("chapter", ch_no, subj, cl_lvl, cre, vq2, ""))

    for subj, sq, sp in REGIONAL_BOARD_SWEEPS:
        tasks.append(("sweep", 0, subj, "", None, sq, sp))

    print(f"Executing {len(tasks)} BoardTube InnerTube queries across {len(SYLLABUS)} chapters...", flush=True)
    raw_by_ch: dict[int, list[dict]] = {r[0]: [] for r in SYLLABUS}
    sweeps: list[tuple[str, dict]] = []

    def worker(t):
        kind, ch_no, subj, cl_lvl, cre, q, sp = t
        payload = search_youtube(q, params=sp, use_cache=use_cache)
        cands = extract_candidates(payload)
        if kind == "chapter":
            kept = [c for c in cands if is_valid_board_candidate(c, ch_no, subj, cl_lvl, cre)]
            return kind, ch_no, subj, kept
        return kind, 0, subj, cands

    with ThreadPoolExecutor(max_workers=24) as pool:
        futs = [pool.submit(worker, t) for t in tasks]
        for f in as_completed(futs):
            kind, ch_no, subj, items = f.result()
            if kind == "chapter":
                raw_by_ch[ch_no].extend(items)
            else:
                for c in items:
                    sweeps.append((subj, c))

    # Route sweeps + sibling regional/board entries across matching chapters
    umbrella_chs = {9, 10, 20, 30, 38, 46, 54}
    ordered_chs = sorted(compiled, key=lambda x: (1 if x[0] in umbrella_chs else 0, x[0]))

    for subj, cand in sweeps:
        for ch_no, c_subj, _, cl_lvl, _, _, cre in ordered_chs:
            if c_subj == subj and is_valid_board_candidate(cand, ch_no, c_subj, cl_lvl, cre):
                raw_by_ch[ch_no].append(cand)
                break

    sib_cands = load_sibling_board_candidates()
    for cand in sib_cands:
        for ch_no, c_subj, _, cl_lvl, _, _, cre in ordered_chs:
            if cre.search(cand["title"]):
                # Verify class-level & subject alignment
                blob = f"{cand['title']} {cand['channel']}".lower()
                if cl_lvl == "Class 10" and not re.search(r"\b(class\s*10|10th|हाईस्कूल|कक्षा\s*10|sslc|madhyamik)\b", blob):
                    continue
                if cl_lvl == "Class 12" and re.search(r"\b(class\s*10|10th|हाईस्कूल|कक्षा\s*10)\b", blob):
                    continue
                if "Physics" in c_subj and re.search(r"\b(chemistry|biology|botany|zoology|रसायन|जीव|गणित|maths)\b", blob):
                    continue
                if "Chemistry" in c_subj and re.search(r"\b(physics|biology|botany|zoology|भौतिकी|जीव|गणित|maths)\b", blob):
                    continue
                if "Maths" in c_subj and re.search(r"\b(physics|chemistry|biology|भौतिकी|रसायन|जीव)\b", blob):
                    continue
                if "Biology" in c_subj and re.search(r"\b(physics|chemistry|भौतिकी|रसायन|गणित|maths)\b", blob):
                    continue
                raw_by_ch[ch_no].append(cand)
                break

    seen_global: set[tuple[str, str]] = set()
    chapter_records: dict[int, list[dict]] = {}
    syllabus_out: list[dict] = []

    for ch_no, subj, unit, cl_lvl, wt, ch_name, _ in ordered_chs:
        enriched = []
        seen_local: set[tuple[str, str]] = set()
        for cand in raw_by_ch[ch_no]:
            gkey = (cand["provider"], cand["video_id"])
            if gkey in seen_global or gkey in seen_local:
                continue
            seen_local.add(gkey)
            lang = cand.get("_preset_lang") or resolve_language(cand)
            stream, fmt = classify_board_stream_and_format(cand, lang)
            age_m, vpm, t_score, t_badge = compute_trend_metrics(cand, fmt)
            enriched.append((t_score, vpm, age_m, t_badge, lang, stream, fmt, cand))

        enriched.sort(key=lambda x: (-x[0], -x[1], -x[7]["view_count"], -x[7]["lesson_count"]))
        vids = [x for x in enriched if x[7]["provider"] == "youtube"]
        pls = [x for x in enriched if x[7]["provider"] == "playlist"]

        picked: list[dict] = []
        edu_cap: dict[str, int] = {}

        def _take(pool_list: list, cap_total: int, max_per_edu: int):
            for t_score, vpm, age_m, t_badge, lang, stream, fmt, cand in pool_list:
                if len(picked) >= cap_total:
                    break
                gkey = (cand["provider"], cand["video_id"])
                if gkey in seen_global:
                    continue
                edu, inst = resolve_educator_and_institute(cand)
                ekey = f"{edu.lower()}::{cand['provider']}"
                if edu_cap.get(ekey, 0) >= max_per_edu:
                    continue
                seen_global.add(gkey)
                edu_cap[ekey] = edu_cap.get(ekey, 0) + 1
                picked.append(
                    {
                        "provider": cand["provider"],
                        "video_id": cand["video_id"],
                        "embed_video_id": cand["embed_video_id"],
                        "url": cand["url"],
                        "title": cand["title"],
                        "channel": cand["channel"],
                        "channel_url": cand["channel_url"],
                        "institute": inst,
                        "educator": edu,
                        "language": lang,
                        "thumbnail": cand["thumbnail"],
                        "subject": subj,
                        "unit": unit,
                        "chapter_no": ch_no,
                        "chapter": ch_name,
                        "class_level": cl_lvl,
                        "weightage": wt,
                        "syllabus_scope": "CBSE · ISC · State Boards",
                        "target_exam": stream,
                        "format": fmt,
                        "lesson_count": cand["lesson_count"],
                        "duration": cand["duration"],
                        "duration_sec": cand["duration_sec"],
                        "views_text": cand["views_text"],
                        "view_count": cand["view_count"],
                        "published": cand["published"],
                        "age_months": age_m,
                        "views_per_month": vpm,
                        "trend_score": t_score,
                        "trend_badge": t_badge,
                        "score": t_score,
                        "note": f"{fmt} by {edu} · {stream} ({lang})",
                        "sample_lectures": cand.get("sample_lectures") or [],
                    }
                )

        _take(vids, 14, 2)
        _take(pls, len(picked) + 7, 2)
        # Regional language & board-stream representation pass (up to 34 items/chapter)
        present_langs = {r["language"] for r in picked}
        for item in enriched:
            if len(picked) >= 34:
                break
            if item[4] not in present_langs:
                _take([item], len(picked) + 1, 3)
                present_langs.add(item[4])
        if len(picked) < 16:
            _take(enriched, 22, 4)

        picked.sort(
            key=lambda r: (
                -r["trend_score"],
                -r["views_per_month"],
                -r["view_count"],
                -r["lesson_count"],
            )
        )
        chapter_records[ch_no] = picked

    all_videos: list[dict] = []
    for ch_no, subj, unit, cl_lvl, wt, ch_name, _ in sorted(compiled, key=lambda x: x[0]):
        recs = chapter_records[ch_no]
        assert recs, f"Chapter {ch_no} ({ch_name}) has 0 entries!"
        for i in range(len(recs) - 1):
            assert recs[i]["trend_score"] >= recs[i + 1]["trend_score"], f"Trend inversion in Ch {ch_no}"
        pl_cnt = sum(1 for r in recs if r["provider"] == "playlist")
        q_enc = urllib.parse.quote_plus(f"{ch_name} {cl_lvl} Board")
        syllabus_out.append(
            {
                "chapter_no": ch_no,
                "subject": subj,
                "unit": unit,
                "class_level": cl_lvl,
                "weightage": wt,
                "syllabus_scope": "CBSE · ISC · State Boards",
                "chapter": ch_name,
                "count": len(recs),
                "playlist_count": pl_cnt,
                "video_count": len(recs) - pl_cnt,
                "yt_playlists_url": f"https://www.youtube.com/results?search_query={q_enc}&sp=EgIQAw%253D%253D",
                "yt_oneshots_url": f"https://www.youtube.com/results?search_query={q_enc}+one+shot",
            }
        )
        all_videos.extend(recs)

    by_edu = Counter(v["educator"] for v in all_videos)
    educators_out = [{"name": k, "count": c} for k, c in by_edu.most_common()]
    langs = Counter(v["language"] for v in all_videos)
    exams = Counter(v["target_exam"] for v in all_videos)

    out = {
        "meta": {
            "title": "BoardTube — All-India Class 10 & 12 Boards Video Solution Studio",
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "total_chapters": len(syllabus_out),
            "total_resources": len(all_videos),
            "playlist_count": sum(1 for v in all_videos if v["provider"] == "playlist"),
            "video_count": sum(1 for v in all_videos if v["provider"] == "youtube"),
            "distinct_channels": len({v["channel"] for v in all_videos}),
            "distinct_educators": len(educators_out),
            "languages": dict(langs.most_common()),
            "streams": dict(exams.most_common()),
            "ranking_policy": "100% Pure YouTube Audience Trend Velocity (views_per_month, view_count, lesson_count) — Zero Coaching Priority",
        },
        "syllabus": syllabus_out,
        "educators": educators_out,
        "videos": all_videos,
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"Built BoardTube data/videos.json: {len(all_videos)} resources across {len(syllabus_out)}/54 chapters "
        f"(cached={STATS['cached']}, live={STATS['requests']})",
        flush=True,
    )
    print(f"Languages ({len(langs)}): {dict(langs.most_common())}", flush=True)
    print(f"Streams   ({len(exams)}): {dict(exams.most_common())}", flush=True)
    return out


if __name__ == "__main__":
    use_c = "--fresh" not in sys.argv
    build_corpus(use_cache=use_c)
