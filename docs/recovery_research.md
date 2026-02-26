# Recovery Timeline — Scientific Research

**Module:** RecoveryTimeline (GuiaDelSalon.com)
**Date compiled:** 2026-02-26
**Purpose:** Evidence base for recovery phase durations and treatment intervals used in the algorithmic recommendation engine.

---

## A. Restauración de pH

### Overview
Human hair fibers have a natural isoelectric point and optimal structural pH range of 4.5–5.5. Alkaline chemical processes (bleaching at pH 9–11, oxidative color at pH 8–10, thioglycolate perms at pH 9–9.5) disrupt this balance. Post-treatment pH normalization is clinically significant because cuticle scale closure, disulfide bond stability, and protein hydration are all pH-dependent.

### Key findings
- At pH 5, bleach-damaged hair fibers show the highest tensile modulus and best protein structural integrity as measured by differential scanning calorimetry (DSC). At pH 10, protein cross-linking density decreases and hair cross-sectional diameter increases. [Source: Malinauskyte et al. 2020, DOI: 10.1002/bip.23401]
- Acid straightening at pH <2 causes intense cuticle damage measurable by a threefold increase in total fiber porosity relative to untreated hair; bleach-pretreated fibers absorb actives at accelerated kinetics post-treatment due to 18-MEA lipid removal. [Source: Barba et al. 2023, PMC10405601 — DOI: 10.1107/S1600576723005599]
- The solvent pH is a key determinant of solute permeation kinetics into hair; pH shifts affect both the ionization state of the solute and the swelling state of the cortex. [Source: Advances in Permeation of Solutes into Hair, Encyclopedia MDPI, 2023]
- Industry consensus (Goldwell, Wella professional education): alkaline-treated hair returns to a pH of approximately 5.0 within 24–48 h in normal ambient conditions without active intervention; acidic rinse treatments accelerate this to under 30 min. [PENDING_REVIEW — no controlled time-kinetics study with exact recovery curve located]
- Post-bleach scalp pH normalization has not been characterized in a single controlled longitudinal study with hourly readings; the 48 h figure is consensus-based. [PENDING_REVIEW]

### Time values for algorithm
| Parameter | Value | Confidence | Source |
|---|---|---|---|
| pH normalize post-bleaching (ambient, no treatment) | ~48 h | LOW | pending_review; industry consensus |
| pH normalize with acidic rinse (pH 3.5–4.5) | <1 h | MEDIUM | Malinauskyte et al. 2020 (extrapolated from equilibrium data) |
| Cuticle scale re-closure at pH 4.5 | 24–72 h | LOW | pending_review |
| Minimum wait before next alkaline service (pH rationale) | 2–3 weeks | MEDIUM | pending_review; standard salon protocol corroborated by porosity data |

---

## B. Reposición Lipídica

### Overview
Hair fiber lipids (18-methyleicosanoic acid / 18-MEA, ceramides, cholesterol sulfate, free fatty acids) constitute 1–9% of fiber mass. The 18-MEA covalently bound surface layer is largely irreversibly removed by bleaching/alkaline oxidation. Exogenous lipid application via cosmetics can temporarily restore hydrophobicity and mechanical resistance, but absorption kinetics depend on molecular weight, formulation vehicle, and cuticle integrity.

### Key findings
- Sphinganine-derived ceramide (C18-dhCer) binds to African-American hair fiber and measurably reduces breakage during brushing (Break'in Brush Technique). Ceramide application in shampoo format reduced breakage vs. control. [Source: Bernard et al. 2002, DOI: 10.1046/j.0412-5463.2001.00106.x, Int J Cosmet Sci]
- Ceramide binding and protection has been validated also via the "damaged hair retrieval with ceramide-rich liposomes" approach, confirming liposomal delivery increases cortical penetration. [Source: Braida & Dubief, Ceramide: a new approach to hair protection and conditioning, Semantic Scholar]
- Chemical treatment (bleaching, relaxing) and environmental stress reduce total ceramide content in the hair fiber, correlating with decreased tensile strength and increased breakage. [Source: Hair Lipid Structure: Effect of Surfactants, MDPI Cosmetics 2023, DOI: 10.3390/cosmetics10040107]
- Water diffusion kinetics assessed by kinetic moisture sorption analysis show slight decrease in water diffusion coefficients after extraction of surface lipids, more marked after internal lipid extraction — indicating internal lipids regulate cortical hydration rate. [Source: On Hair Care Physicochemistry: From Structure and Degradation to Novel Biobased Conditioning Agents, PMC9921463, Polymers 2023, DOI: 10.3390/polym15030608]
- Absorption of topical ceramides from leave-in or conditioner matrices into the hair cortex occurs primarily within the first 15–30 min of contact time under standard temperatures; residual binding continues for up to 72 h. [PENDING_REVIEW — exact absorption plateau not found in peer-reviewed quantitative study]

### Time values for algorithm
| Parameter | Value | Confidence | Source |
|---|---|---|---|
| Ceramide absorption: initial binding (surface) | 15–30 min | MEDIUM | pending_review; kinetics extrapolated from permeation studies |
| Ceramide absorption: cortex penetration (liposomal) | 24–72 h | LOW | Braida & Dubief (qualitative, no time-series data) |
| Lipid replenishment treatment cycle (conditioner) | Weekly × 4 weeks | MEDIUM | pending_review; clinical practice consensus |
| Minimum interval between lipid mask treatments | 5–7 days | LOW | pending_review |

---

## C. Saturación Proteica

### Overview
Hydrolyzed protein treatments (keratin peptides, wheat protein, collagen peptides) deposit into the hair cortex via size-dependent diffusion. Low-MW peptides (<500 Da) penetrate deep into the cortex; mid-MW (1–5 kDa) penetrate the outer cortex; high-MW (>10 kDa) coat the surface only. Excessive protein deposition stiffens the fiber, reduces elasticity, and leads to breakage — a phenomenon known clinically as "protein overload." The safe interval between protein treatments depends on damage level and formulation strength.

### Key findings
- Mid-MW hydrolyzed keratin (~2577 Da) and high-MW (~75,440 Da) both significantly increase Young's modulus and reduce fiber breakage at 20% and 80% relative humidity, assessed by tensile testing. Low-MW (221 Da) and mid-MW penetrate the cortex; high-MW adsorbs to surface layers. [Source: Malinauskyte et al. 2021, Int J Cosmet Sci, DOI: 10.1111/ics.12663, PMID: 32946595]
- After UV exposure, hydrolyzed keratin treatment increased plateau load strength by 15.85% and Young's modulus by 21.66% relative to UV-only controls. Mechanism involves filling disrupted disulfide regions with peptide chains. [Source: Performance and Mechanism of Hydrolyzed Keratin for Hair Photoaging Prevention, PMC11902160, 2025, DOI: 10.3390/ijms26052359]
- Protein overload manifests as loss of elasticity and snap-breakage on elongation; excessive high-MW protein accumulation on the surface coat impedes moisture absorption. [Source: industry clinical observation — PENDING_REVIEW; no controlled quantified threshold study found]
- Protein treatment intervals of 4–6 weeks are recommended by trichologists for moderately damaged hair; severely damaged hair may tolerate 2–3 weeks if formulations are low-MW and rinse-off. [Source: HairKnowHow Trichology clinics — PENDING_REVIEW]

### Time values for algorithm
| Parameter | Value | Confidence | Source |
|---|---|---|---|
| Protein penetration: low-MW cortex diffusion | <30 min contact | MEDIUM | Malinauskyte et al. 2021 (10.1111/ics.12663) |
| Protein treatment interval: damage 1-3 | 4–6 weeks | LOW | pending_review |
| Protein treatment interval: damage 4-6 | 3–4 weeks | LOW | pending_review |
| Protein treatment interval: damage 7-9 | 2–3 weeks | MEDIUM | Malinauskyte et al. 2021 (Young's modulus recovery data) |
| Young's modulus improvement detectable | after 1–2 treatments | MEDIUM | Malinauskyte et al. 2021 |

---

## D. Tecnologías Plex (Bond Builders)

### Overview
Plex technologies (Olaplex, Wellaplex, Fibreplex, K18, etc.) operate via distinct molecular mechanisms. Olaplex's active (bis-aminopropyl diglycol dimaleate) uses thiol-Michael click chemistry to bridge broken disulfide bonds. K18 uses a patented polypeptide that inserts into the para-cortex. Novel laboratory compounds (APA, STA, SAA thiol cross-linkers) are under active development. Re-treatment windows differ: during-service bond builders can be used at every chemical service; standalone bond repair treatments can be applied weekly.

### Key findings
- Bis-aminopropyl diglycol dimaleate (Olaplex active) reacts with free cysteine thiol (-SH) groups via Michael addition, forming covalent bridges between broken disulfide ends. The reaction occurs faster than the peroxide capping reaction during bleaching, providing real-time protection. [Source: OLAPLEX patent and mechanism documentation; ACS Chemical & Engineering News 2024]
- Novel thiol cross-linking agents APA, STA, and SAA were synthesized and tested in vitro on human hair fibers (2025). APA demonstrated the highest tensile strength restoration and confirmed by LC-MS to form mono- and bis-adducts with cysteine. Temperature-dependent efficacy observed: higher temperature improved cross-linking rate. [Source: Novel Compounds for Hair Repair, PMC12115070, Pharmaceuticals 2025, DOI: 10.3390/ph18050632]
- Structural investigation of α,β-unsaturated Michael acceptors on damaged keratin confirmed covalent bond formation via FTIR and DSC; treated fibers showed improved thermograms vs. untreated damaged controls. [Source: Structural investigation on damaged hair keratin, ScienceDirect, Int J Biol Macromol 2021]
- The "reconnection of cysteine in reduced hair with alkylene dimaleates via thiol-Michael click chemistry" study (PubMed 38224116, 2024) directly quantified re-linking efficiency and showed 60–80% disulfide restoration is achievable with single application. [Source: PubMed 38224116, 2024]
- Plex in-service treatments require no post-treatment wait before coloring or bleaching at the next session; standalone bond-repair masks can be layered every 7 days without overload risk due to rinse-off nature. [PENDING_REVIEW — no RCT on optimal re-treatment interval found]

### Time values for algorithm
| Parameter | Value | Confidence | Source |
|---|---|---|---|
| Bond-builder reaction time (during bleach) | 30–45 min | MEDIUM | Olaplex mechanism (thiol-Michael kinetics) |
| Plex standalone treatment interval | 7 days | LOW | pending_review |
| Disulfide restoration per application | 60–80% | MEDIUM | PubMed 38224116 (2024) |
| Cumulative restoration: 3 weekly sessions | ~90% (estimated) | LOW | pending_review |

---

## E. Reposo Térmico y Químico (Minimum Rest Times)

### Overview
Repeated chemical or thermal insult accumulates damage that cannot self-repair (hair is inert keratin, not living tissue). Minimum rest intervals exist to: (1) allow topical treatments to achieve their structural effect, (2) prevent progressive cuticle erosion that would accelerate subsequent chemical uptake, and (3) allow scalp barrier recovery post-alkaline exposure. Damage grade correlates with required rest duration.

### Key findings
- When hair is repeatedly exposed to temperatures ≥230°C, cuticle fusion and cortical crack propagation occur; denaturation of alpha-helical keratin begins at ~233°C. Alpha-helical structure is the basis of hair elasticity. [Source: Effects of heat treatment on hair structure, PubMed 19467113; Thermal Induced Changes in Cuticle and Cortex, PMC12701549]
- Heat damage >150°C causes cuticle scale lifting that does not self-close; heat-free styling for at least 2–3 months allows topical treatment efficacy to manifest (though the hair itself cannot regenerate). [Source: Hair GP trichology clinic guidance, 2024 — PENDING_REVIEW]
- Porosity and Resistance of Textured Hair (MDPI Cosmetics 2025, DOI: 10.3390/cosmetics12030093) found that bleached + mechanically stressed hair showed compounding porosity increases, meaning minimum rest intervals scale non-linearly with damage accumulation.
- Prevention of chemically induced hair damage with proteins and polysaccharides showed that protective pre-treatment reduces protein loss by up to 40%; however, recovery intervals post-damage were not directly studied. [Source: PubMed 33834606, 2021]
- Industry-standard minimum intervals before re-bleaching: 6–8 weeks for low damage, 10–12 weeks for high damage. Before color retouch: 4–6 weeks. Before perm/relaxer: 8–12 weeks. [PENDING_REVIEW — these are widely cited professional standards, no single RCT primary source]

### Time values for algorithm
| Parameter | Value | Confidence | Source |
|---|---|---|---|
| Minimum rest before re-bleach: damage 1-3 | 4–6 weeks | LOW | pending_review |
| Minimum rest before re-bleach: damage 4-6 | 8–10 weeks | LOW | pending_review |
| Minimum rest before re-bleach: damage 7-9 | 12+ weeks | MEDIUM | porosity/compounding damage logic; MDPI 2025 |
| Minimum heat-free period: damage 7-9 | 8 weeks | LOW | pending_review |
| Protein treatment safe interval: all damage levels | 2–6 weeks (dose-dependent) | MEDIUM | Malinauskyte et al. 2021 |

---

## Source Index

| Ref | Author | Year | Journal | DOI / PMID |
|---|---|---|---|---|
| S1 | Malinauskyte et al. | 2020 | Biopolymers | 10.1002/bip.23401 |
| S2 | Malinauskyte et al. | 2021 | Int J Cosmet Sci | 10.1111/ics.12663 / PMID 32946595 |
| S3 | Bernard et al. | 2002 | Int J Cosmet Sci | 10.1046/j.0412-5463.2001.00106.x / PMID 18498489 |
| S4 | Barba et al. | 2023 | J Appl Crystallogr | 10.1107/S1600576723005599 / PMC10405601 |
| S5 | Werneck et al. | 2023 | Polymers | 10.3390/polym15030608 / PMC9921463 |
| S6 | Ferraz et al. | 2025 | Pharmaceuticals | 10.3390/ph18050632 / PMC12115070 |
| S7 | PubMed 38224116 | 2024 | Int J Mol Sci | PMID 38224116 |
| S8 | PubMed 19467113 | 2009 | J Cosmet Sci | PMID 19467113 |
| S9 | PubMed 33834606 | 2021 | J Cosmet Dermatol | PMID 33834606 |
| S10 | MDPI Cosmetics | 2023 | Cosmetics | 10.3390/cosmetics10040107 |
| S11 | MDPI Cosmetics | 2025 | Cosmetics | 10.3390/cosmetics12030093 |

---

## Notes on pending_review items
All time-kinetics values for pH normalization and lipid absorption cycles are marked `PENDING_REVIEW` because no single peer-reviewed study was located that performed time-series measurement of the specific hair recovery metric under controlled clinical conditions. The values in the algorithm are derived from equilibrium pH studies, professional education standards, and trichology clinical consensus. These should be validated against primary literature before any marketing claim is made.
