-- Una demostración trivial: probar que 2 + 2 es igual a 4
theorem dos_mas_dos : 2 + 2 = 4 := by
  rfl

-- Una prueba un poco más interesante por inducción: n + 0 = n para cualquier natural n
theorem suma_cero (n : Nat) : n + 0 = n := by
  induction n with
  | zero =>
    -- Caso base: 0 + 0 = 0
    rfl
  | succ n ih =>
    -- Paso inductivo: si k + 0 = k, entonces (k + 1) + 0 = (k + 1)
    simp
