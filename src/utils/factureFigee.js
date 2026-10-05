// Facture définitive : les données sont enregistrées à l'émission (inscriptions.facture_snapshot) et réutilisées
// ensuite, pour qu'une facture déjà émise ne change plus quand le contact du dossier change.

// Copie à enregistrer au moment de l'émission
export const instantaneFacture = ({ form, nb, total, numero, dateEmission }) => ({
  form: {
    nom: form?.nom || '', prenom: form?.prenom || '', organisation: form?.organisation || '',
    poste: form?.poste || '', pays: form?.pays || '', email: form?.email || '',
  },
  nb,
  total,
  numero,
  date_emission: dateEmission || new Date().toISOString(),
  figee_le: new Date().toISOString(),
})

// Arguments du générateur : la copie figée si elle existe, sinon les données actuelles (comportement d'origine)
export const argumentsFacture = ({ snapshot, formVivant, nb, total, numero }) => {
  if (snapshot?.form) {
    return {
      form: snapshot.form,
      nb: snapshot.nb ?? nb,
      total: snapshot.total ?? total,
      numeroFacture: snapshot.numero || numero,
      dateEmission: snapshot.date_emission || null,
    }
  }
  return { form: formVivant, nb, total, numeroFacture: numero, dateEmission: null }
}
