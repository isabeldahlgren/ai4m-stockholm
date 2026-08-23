<!--
   THE RESOURCES PAGE.

   Each entry is one line starting with "-", holding a link written as
   [Title](web address), and an indented line under it with the note.
   The note is optional. To add a section, copy a "##" block.
-->

# Resources

A short, deliberately selective list for mathematicians who want to find their way into the subject. It is a starting point rather than a survey, and we add to it as the seminar goes along.

> Suggestions are very welcome — send anything you think belongs here to {email}.

## Orientation :: Where to begin

- [Jeremy Avigad, *Mathematics and the formal turn*](https://arxiv.org/abs/2311.00007)
  An essay on what formalisation is doing to mathematical practice. A good first orientation to the questions, written for mathematicians rather than logicians.
- [Terence Tao, *What's new*](https://terrytao.wordpress.com/)
  Tao writes regularly about his own experiments with proof assistants and language models; the posts are the most useful running commentary available from a working mathematician.
- [Kevin Buzzard, *The Xena Project*](https://xenaproject.wordpress.com/)
  A long-running blog on formalising modern mathematics in Lean, including the case for why a mathematician should care.

## Formalisation :: Lean and proof assistants

### Starting out

- [The Natural Number Game](https://adam.math.hhu.de/)
  Builds the elementary theory of the natural numbers in Lean, in the browser, with no installation. An hour here is the cheapest possible introduction to what a proof assistant feels like.
- [Lean 4 Web](https://live.lean-lang.org/)
  A browser editor with Mathlib available, useful for trying something out before installing anything.
- [Mathematics in Lean](https://leanprover-community.github.io/mathematics_in_lean/)
  The standard textbook for mathematicians learning Lean, organised by mathematical subject and worked through as exercises.

### Going further

- [Lean community](https://leanprover-community.github.io/)
  Installation instructions, documentation, and the entry point to everything else in the ecosystem.
- [Theorem Proving in Lean 4](https://lean-lang.org/theorem_proving_in_lean4/)
  The reference introduction to the language and its dependent type theory.
- [Kevin Buzzard, *Formalising Mathematics*](https://github.com/ImperialCollegeLondon/formalising-mathematics-2024)
  A full lecture course with problem sheets, taught to mathematics students at Imperial College London.
- [Mathlib documentation](https://leanprover-community.github.io/mathlib4_docs/)
  The searchable API of Mathlib, the unified library of formalised mathematics. See also [Loogle](https://loogle.lean-lang.org/) for searching it by the shape of a statement.
- [Lean Zulip](https://leanprover.zulipchat.com/)
  Where the community actually works. Newcomers' questions are answered quickly and patiently in the "new members" stream.

## Reading :: Machine learning in mathematics

- [Davies et al., *Advancing mathematics by guiding human intuition with AI*](https://www.nature.com/articles/s41586-021-04086-6)
  Nature, 2021. Machine learning used to suggest conjectures in knot theory and representation theory, which were then proved by hand. An early and still instructive template for the collaboration.
- [Romera-Paredes et al., *Mathematical discoveries from program search with large language models*](https://www.nature.com/articles/s41586-023-06924-6)
  Nature, 2023. The FunSearch method: a language model proposes programs, an evaluator keeps what verifies. Produced new constructions for the cap set problem.
- [Trinh et al., *Solving olympiad geometry without human demonstrations*](https://www.nature.com/articles/s41586-023-06747-5)
  Nature, 2024. AlphaGeometry, a neuro-symbolic system reaching near gold-medal performance on olympiad geometry.
- [AlphaProof and AlphaGeometry 2](https://deepmind.google/discover/blog/ai-solves-imo-problems-at-silver-medal-level/)
  DeepMind's account of solving International Mathematical Olympiad problems with formal search in Lean.
- [LeanDojo](https://leandojo.org/)
  Open tooling and datasets for machine learning with Lean, and a reasonable place to start if you want to run experiments yourself.

## Evaluation :: Benchmarks

- [miniF2F](https://github.com/openai/miniF2F)
  Olympiad-level problems stated formally, the long-standing benchmark for automated theorem proving.
- [PutnamBench](https://github.com/trishullab/PutnamBench)
  Putnam competition problems formalised in Lean, Isabelle and Coq.
- [FrontierMath](https://epoch.ai/frontiermath)
  Unpublished research-level problems written by working mathematicians, designed to resist memorisation.

## Elsewhere :: Community and funding

- [AI for Math Fund](https://renaissancephilanthropy.org/ai-for-math-fund/)
  Grants for work on formalisation, datasets and tools at the intersection of the two fields.
- [AI Mathematical Olympiad Prize](https://aimoprize.com/)
  An open competition to build models that solve olympiad problems, with public leaderboards and released solutions.
- [IPAM, *Machine Assisted Proofs*](https://www.ipam.ucla.edu/programs/workshops/machine-assisted-proofs/)
  Recorded lectures from the 2023 workshop, still one of the better overviews of the research landscape.

## Local :: In Stockholm

- [Department of Mathematics, KTH](https://www.kth.se/math)
- [Department of Mathematics, Stockholm University](https://www.math.su.se/)
