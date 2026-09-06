# Spot the Error — Stage 2 categorization spec

Categorize an item by the specific rule whose own formula or procedure was
misapplied at the flagged step. Do not categorize it by the rule the overall
problem is about, or by an outer structure that merely contains the mistake.

Apply this procedure in order and stop at the first match.

1. **Units/Interpretation Slip** — Every differentiation step is mechanically
   correct; the only error is the final real-world label or meaning (for
   example, missing units or treating an instantaneous rate as a one-time
   change).
2. **Algebra/Simplification Slip** — Every differentiation rule is applied
   correctly and completely; the only error is later algebra such as combining
   terms, distributing, factoring, or reducing a fraction.
3. Otherwise, classify the innermost mechanical failure:
   - **Power Rule Slip** — A term's coefficient × exponent arithmetic is
     wrong, including inside a product, quotient, or chain-rule inner function.
   - **Chain Rule Slip** — The inner derivative is omitted altogether (treated
     as absent or as 1). If an inner derivative is attempted but its own power
     arithmetic is wrong, it is a Power Rule Slip instead.
   - **Trig/Exp/Log Rule Slip** — The known outer derivative rule for the
     trig, exponential, or logarithmic function is wrong, independently of any
     inner-derivative multiplier.
   - **Product/Quotient Rule Slip** — The product or quotient formula itself is
     structurally wrong: a missing term, wrong operation, quotient sign error,
     or missing/incorrect squared denominator. If that structure is correct
     but a sub-derivative is wrong, use the category for that sub-computation.

Apply the same test recursively at every nesting depth: find the innermost
mechanical failure and classify that rule alone.
