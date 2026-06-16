function titleCase(str) {
	const splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		// You do not need to check if i is larger than splitStr length, as your for does that for you
		// Assign it back to the array
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	// Directly return the joined string
	return splitStr.join(' ').trim();
}

function addTransfer(p, modes) {
	const numTr = Object.values(modes).reduce((total: number, x: number) => total + (x === 1 ? 1 : 0), 0);
	let addedTr = 0;
	if (numTr === 0) {
		return p;
	}

	function needsAnd(numTr, addedTr) {
		return numTr > 1 && addedTr === numTr - 1;
	}

	p = p + ' . ( Há correspondência ) com ';
	if (modes.light_rail === 1) {
		p = p + (needsAnd(numTr, addedTr) ? ' e o ' : ' o ') + 'métro ligeiro';
		addedTr += 1;
	}
	if (modes.subway === 1) {
		p = p + (needsAnd(numTr, addedTr) ? ' e o ' : ' o ') + 'métro';
		addedTr += 1;
	}
	if (modes.train === 1) {
		p = p + (needsAnd(numTr, addedTr) ? ' e o ' : ' o ') + 'combóio';
		addedTr += 1;
	}
	if (modes.boat === 1) {
		p = p + (needsAnd(numTr, addedTr) ? ' e o ' : ' o ') + 'barco';
		addedTr += 1;
	}
	if (modes.bike_sharing === 1) {
		p = p + (needsAnd(numTr, addedTr) ? ' e ' : ' ') + 'biciclétas partilhadas';
		addedTr += 1;
	}
	if (modes.airport === 1) {
		p
			= p + (needsAnd(numTr, addedTr) ? ' e o ' : ' o') + 'aéroporto (air port)';
		addedTr += 1;
	}
	return p;
}

/* * */

function createPhoneticText(p) {
	let thisString = p;
	/* Uniformize crossing to (X), add spaces around crossing */
	let regex = /\(X\)/giu;
	thisString = thisString.replace(regex, ' X ');
	regex = /\bAnt[e]?[s]?[\s]?[(]?X[)]?([\s]+$)/giu;
	thisString = thisString.replace(regex, 'Antes do Cruzamento ');
	regex = /\bAnt[e]?[s]?[\s]?[(]?X[)]?([\s]+[^$])/giu;
	thisString = thisString.replace(regex, 'Antes do Cruzamento com $1');
	regex = /[(]?X[)]?[\s]?Ant[e]?[s]?\s/giu;
	thisString = thisString.replace(regex, ' Cruzamento Antes de ');
	regex = /[\s][(]?X[)]?[\s]*($|\))/giu;
	thisString = thisString.replace(regex, ' Cruzamento $1');
	regex = /(^|[(])[\s]*[(]?X[)]?\s/giu;
	thisString = thisString.replace(regex, '$1 Cruzamento ');
	regex = /([gpsgqvzt])X/giu;
	thisString = thisString.replace(regex, '$1 X ');
	regex = /([^aEIBXN])X([^XTaeIO])/giu;
	thisString = thisString.replace(regex, '$1 X $2');
	regex = /([^aeiouãõâêîôûáéíóúàèìòùbxn)\s])([(]?X[)]?)(?![aeiou])/giu;
	thisString = thisString.replace(regex, '$1 X ');
	regex = /([(]?X[)]?)([^xaieouãõâêîôûáéíóúàèìòùt(\s)])/giu;
	thisString = thisString.replace(regex, ' X $2');
	regex = /([(]?X[)]?)(?=Aceiro)/giu;
	thisString = thisString.replace(regex, ' X ');
	regex = /([(]?X[)]?)(?=Estr)/giu;
	thisString = thisString.replace(regex, ' X ');
	regex = /([^aeioutfcsrpbndâêîôûáéíóúàèìòù\s])(R\s)/giu;
	thisString = thisString.replace(regex, '$1 R ');
	/* Add spaces around parenthesis */
	regex = /([^\s])\(([^X])/giu;
	thisString = thisString.replace(regex, '$1 ( $2');
	regex = /\(([^\sX])/giu;
	thisString = thisString.replace(regex, '( $1');
	regex = /([^\sX])\)/giu;
	thisString = thisString.replace(regex, '$1 )');
	regex = /([^X])\)([^\s])/giu;
	thisString = thisString.replace(regex, '$1 ) $2');
	/* Add spaces around road numbers */
	regex = /(^|\(|\sX)[\s]*N[ac\s]?((\d)+)([\s\-()]|$)/giu;
	thisString = thisString.replace(regex, '$1 Estrada Nacional $2 ');
	regex = /\bN([\d]{3})-(\d)\b/giu;
	thisString = thisString.replace(regex, ' Estrada Nacional $1 $2 ');
	regex = /(?!\sE)\sN[.\s]*[º]?[\s]?((\d)+[a-g]?)[\s]*([()]?)$/giu;
	thisString = thisString.replace(regex, ' ( Número $1 $3 ) ');
	/* Add months of the year */
	regex = /\b(Jan[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Janeiro$2');
	regex = /\b(Fev[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Fevereiro$2');
	regex = /\b(Abr[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Abril$2');
	regex = /\b(Jun[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Junho$2');
	regex = /\b(Jul[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Julho$2');
	regex = /\b(Ago[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Agosto$2');
	regex = /\b(Set[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Setembro$2');
	regex = /\b(Out[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Outubro$2');
	regex = /\b(Nov[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Novembro$2');
	regex = /\b(Dez[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Dezembro$2');
	/* Resolve reading dates */
	regex = /\b1[.\s]?[ºo]?[\s]*(de)?[\s]*(?=Jane|Feve|Març|Abr|Maio|Junh|Julh|Agosto|Setem|Outu|Novem|Dez)/giu;
	thisString = thisString.replace(regex, 'Primeiro de ');
	regex = /([\d]+|Primeiro)([\s]*)(?=Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)/giu;
	thisString = thisString.replace(regex, '$1 de ');
	/* Add spaces around numbers */
	regex = /([^\s\d])(\d)/giu;
	thisString = thisString.replace(regex, '$1 $2');
	regex = /(\d)([^\s\dºª])/giu;
	thisString = thisString.replace(regex, '$1 $2');
	regex = /([\d]+)[\s]*\/[\s]*([\d]+)/giu;
	thisString = thisString.replace(regex, '$1 $2');
	regex = /(?<=Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)[\s]*([\d]{1,3}\b)/giu;
	thisString = thisString.replace(regex, ' número $1');
	regex = /(?<!P)[\s]+1\b/giu;
	thisString = thisString.replace(regex, ' - Um ');
	/* Resolve common street abbreviations */
	regex = /\b(Alm(ad)?[.]?)\s(Neg[^\s]*)/giu;
	thisString = thisString.replace(regex, 'Almáda Negreiros');
	regex = /\b(Al[m]?[.]?)\s(Gag[^\s]*)/giu;
	thisString = thisString.replace(regex, 'Almirante Gago');
	regex = /\b(Al[m]?[.]?)\s(Garr[^\s]*)/giu;
	thisString = thisString.replace(regex, 'Almeida Garret');
	regex = /\b(Al[m]?[.]?)\s(Reis)/giu;
	thisString = thisString.replace(regex, 'Almirante Reis');
	regex = /(^|\s)(Al(am)?[.]?[aª]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Alameda ');
	regex = /\b(Alm[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Almirante ');
	regex = /\bM\s+R\s+(?=Bastos)/giu;
	thisString = thisString.replace(regex, 'Majór Rosa ');
	regex = /\b(Bº[.]?)/giu;
	thisString = thisString.replace(regex, 'Bairro ');
	regex = /\bB[\s]*(?=Azeit)/giu;
	thisString = thisString.replace(regex, 'Brejos de ');
	regex = /\b(B[oº][.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Bairro$2');
	regex = /(^|\(|\sX)[\s]?B[oº]?[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, '$1 Bairro$2');
	regex = /\b(P[r]?[cç][a]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Práça$2');
	regex = /\b(P[r]?[cç]t[a]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Praceta$2');
	regex = /\b(P[r]?[cç]?t[a][.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Praceta$2');
	regex = /\b(Prac[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Praceta$2');
	regex = /\b(P[a]?[r]?[q](ue)?[.]?)(\s)(Camp[^\s]*)\b/giu;
	thisString = thisString.replace(regex, 'Parque de Campismo');
	regex = /\b(P[a]?[r]?[q](ue)?[.]?)(\s)(Inf[^\s]*)\b/giu;
	thisString = thisString.replace(regex, 'Parque Infantil');
	regex = /\b(P[a]?[r]?[q](ue)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Parque ');
	regex = /\b(P[a]?[r]?[q](ue)?[.]?)(\s)(?=Est)/giu;
	thisString = thisString.replace(regex, ' Parque ');
	regex = /(?<=Parque)\s*Est[a]?[c]?[i]?[o]?[n]?[a]?[m]?[.]?($|\s)/giu;
	thisString = thisString.replace(regex, ' de Estacionamento ');
	regex = /\b(Estaciona[m]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Estacionamento$2');
	regex = /\b(C[m]?[p]?[.]?[oº]?)(\s)(?=Fut|Bol|Jog)/giu;
	thisString = thisString.replace(regex, 'Campo$2');
	regex = /\b(Fut[e]?[b]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Futeból$2');
	regex = /\b(Viad[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Viaduto$2');
	regex = /\b(Vdt[o]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Viaduto$2');
	regex = /\b(Aqued[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Aqueduto$2');
	regex = /\b(Ed[ií]f[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Edifício ');
	regex = /(?<=(^|\(|-|\)))(\s)*Ed(\s|$)/giu;
	thisString = thisString.replace(regex, ' Edifício ');
	regex = /\b(Imp[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Impasse ');
	regex = /\b(P[n]?t[e]?[.]?)(\s)(?=V)/giu;
	thisString = thisString.replace(regex, 'Ponte$2');
	regex = /\b(P[n]?t[e]?[.]?)(\s)(?=2)/giu;
	thisString = thisString.replace(regex, 'Ponte$2');
	regex = /\b(V[a]?[l][.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Vale$2');
	regex = /\b(Qt[aª]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Quinta$2');
	regex = /\bChaf(\s|$)/giu;
	thisString = thisString.replace(regex, 'Chafariz$1');
	regex = /\b(R[o]?[t][.]?)\b/giu;
	thisString = thisString.replace(regex, 'Rotunda');
	regex = /\bF(on)?t[e]?[.]?[\s]*Prata/giu;
	thisString = thisString.replace(regex, 'Fonte da Prata');
	regex = /\bF(on)?t[e]?[.]?[\s]*Luminosa/giu;
	thisString = thisString.replace(regex, 'Fonte Luminosa');
	regex = /\b(T[r]?[a]?v[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Travessa');
	regex = /\b(Tr(?![êeoiu])[a]?[v]?[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Travessa');
	regex = /\b(Urb(an)?[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Urbanização');
	regex = /\b(V[i]?v[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Vivenda');
	regex = /\b(Herd[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Herdáde');
	regex = /\b(L[r]?g[o]?[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Largo');
	regex = /\b(Lt[e]?[.]?)\b/giu;
	thisString = thisString.replace(regex, '- Lóte');
	regex = /\b(C[l]?ç[d]?[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Calçáda');
	regex = /\b(Mt[e]?[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Monte');
	regex = /\bCast[.]?(\s|$|\))/giu;
	thisString = thisString.replace(regex, 'Castelo$1');
	regex = /\b(Estr[.]?)\sM[un]?(?=\d)/giu;
	thisString = thisString.replace(regex, 'Estrada Municipal ');
	regex = /\b(Estr[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Estrada ');
	regex = /\b(Est[.]?)\s(?=Pris)/giu;
	thisString = thisString.replace(regex, 'Estabelecimento ');
	regex = /\b(Est(a[çc])?[.]?)\s/giu;
	thisString = thisString.replace(regex, '- Estaçaão ');
	regex = /\s(Rodov[.]?)\b/giu;
	thisString = thisString.replace(regex, ' Rodoviária');
	regex = /\b(Rest[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Restaurante ');
	regex = /\b(Esp[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Espaço ');
	regex = /\b(E[\s]?N[ac]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Estrada Nacional ');
	regex = /\b([E][\s]?M[un]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Estrada Municipal ');
	regex = /\b((C|Ca|Cam|Caminho)?[\s]?M[un]?)\s+(?=\d{4})/giu;
	thisString = thisString.replace(regex, ' Caminho Municipal ');
	regex = /\b((E|Est|Estr|Estrada)?[\s]?M[un]?)\s+(?=\d{3})/giu;
	thisString = thisString.replace(regex, ' Estrada Municipal ');
	regex = /\s([A][\s]?E)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Autóstrada ');
	regex = /\b(Km[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Quilómetro ');
	regex = /s\s(Mun(ici)?(p)?[.]?)\b/giu;
	thisString = thisString.replace(regex, 's Municipais');
	regex = /\sC[âa]m[.]?\s(?=Mun)/giu;
	thisString = thisString.replace(regex, ' Câmara ');
	regex = /\sFreg[.]?\b/giu;
	thisString = thisString.replace(regex, ' Freguesia');
	regex = /\sConcel[.]?\b/giu;
	thisString = thisString.replace(regex, ' Concelho');
	regex = /\b(C(al)?ç[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Calçada ');
	regex = /\s(Mun[i]?[c]?(?![í])[i]?(p)?[.]?)\b/giu;
	thisString = thisString.replace(regex, ' Municipal');
	regex = /\bCam[\s]+(?!M)/giu;
	thisString = thisString.replace(regex, 'Caminho ');
	regex = /\b([C][a]?[m]?[\s]?M[u]?[n]?)[\s]*(?=[\d])/giu;
	thisString = thisString.replace(regex, 'Caminho Municipal ');
	regex = /\b([C][aâ]?[m]?[\s]*M[u]?[n]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Câmara Municipal ');
	regex = /\sM([\d]{3})\b/giu;
	thisString = thisString.replace(regex, ' Municipal $1');
	regex = /(\s|^)(F[aá]b[r]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Fábrica $3');
	regex = /\b(Qrt[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Quartel');
	regex = /\b(Ord[.]?)(\s)*(?=Mil)/giu;
	thisString = thisString.replace(regex, 'Ordem ');
	regex = /\b(Milit[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Militar ');
	regex = /\b(Seg[.]?)\s(?=Soc)/giu;
	thisString = thisString.replace(regex, 'Segurança ');
	regex = /(?<=Segurança)[\s]*Soc(i)?(a)?(l)?(\s|$|\))/giu;
	thisString = thisString.replace(regex, ' Social ');
	regex = /\b(Res[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Reserva ');
	regex = /\b(Nat[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Natural ');
	regex = /\b(J(un)?[t]?[a]?[.]?)\s(de\s)?(Freg(uesia)?[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Junta de Freguesia ');
	regex = /\b(Ass[o]?[c]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Associação ');
	regex = /\s(Soc(ied)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Sociedade ');
	regex = /\b(Bomb[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Bombeiros$2');
	regex = /\b(Condom[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Condomínio$2');
	regex = /\b(Resid[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Residência$2');
	regex = /\b(Rec[r]?[e]?[a]?[t]?[i]?[v]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Recreativo ');
	regex = /\b(Volunt[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Voluntários$2');
	regex = /\b(Florest[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Florestal ');
	regex = /\s(Co[\s]?op[.]?)\b/giu;
	thisString = thisString.replace(regex, ' Cooperativa');
	regex = /\b(E[s]?[c]?[.]?[\s]?B[.]?[\s]?)([\d]+)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Escola Básica $2 ');
	regex = /\b(E[s]?[c]?[.]?[\s]?B[.]?[\s]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Escola Básica ');
	regex = /\b(Esc[.]?)(\s|$|\))/giu;
	thisString = thisString.replace(regex, 'Escola ');
	regex = /(?<=Escola\s)Prep(\s|$)/giu;
	thisString = thisString.replace(regex, 'Preparatória ');
	regex = /(?<=Escola\s)Prim(\s|$)/giu;
	thisString = thisString.replace(regex, 'Primária ');
	regex = /(?<=Escola\s)Cond(\s|$)/giu;
	thisString = thisString.replace(regex, 'Condução ');
	regex = /(?<=Esc)((.)*?(\s|\(|\)))Tec[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, '$1 Técnica ');
	regex = /(?<=Esc)((.)*?(\s|\(|\)))Prof[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, '$1 Profissional ');
	regex = /\bPSP\b/giu;
	thisString = thisString.replace(regex, 'Polícia');
	regex = /(?<=Escola\s)Nac(\s|$)/giu;
	thisString = thisString.replace(regex, 'Nacional ');
	regex = /\b(Col[.]?)\s/giu;
	thisString = thisString.replace(regex, 'Colégio ');
	regex = /\b(Acad[.]?)\s/giu;
	thisString = thisString.replace(regex, 'Academia ');
	regex = /\b(Cid[.]?)\s/giu;
	thisString = thisString.replace(regex, 'Cidáde ');
	regex = /\bC[.]?(?=\s+Univ)/giu;
	thisString = thisString.replace(regex, 'Cidáde ');
	regex = /(?<=Cidade)[\s]*(Univ(ers)?[.]?)\s/giu;
	thisString = thisString.replace(regex, ' Universitária ');
	regex = /\b(Univ(ers)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Universidade ');
	regex = /\b(Hosp[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Hospital ');
	regex = /\b(B[áa][s][i]?[c]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Básica ');
	regex = /\b(Sec[u]?[n]?[d]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Secundária ');
	regex = /\s(C[\s]?[+][\s]?S)\b/giu;
	thisString = thisString.replace(regex, ' Básica e Secundária');
	regex = /\b2[\s]+3\s/giu;
	thisString = thisString.replace(regex, ' Segundo e Terceiro ');
	regex = /\b(C(e|en|ent|entr|entro)?[.]?)([\s]?Com(?!uni)(er)?[c]?(ial)?)/giu;
	thisString = thisString.replace(regex, 'Centro Comercial');
	/* Avoid conflict with Casa */
	regex = /(?<=Camilo)[\s]+C[.]?[\s]+(?=Bran)/giu;
	thisString = thisString.replace(regex, ' Castelo ');
	regex = /\b(C(a|as|asa)?[.]?)\s*(?=Mis)/giu;
	thisString = thisString.replace(regex, 'Cása ');
	regex = /(?<=Casa)\s*Mis(er)?(ic)?([óo]r)?[d]?($|\s)/giu;
	thisString = thisString.replace(regex, ' Misericórdia ');
	regex = /\sC[.]?\sC[.]?[\s]+(?=\w)/giu;
	thisString = thisString.replace(regex, ' Centro Comercial ');
	regex = /\b(Z[o]?[n]?[a]?[.]?)([\s]?Ind[úu]?[s]?[t]?[r]?[i]?[a]?[l]?)/giu;
	thisString = thisString.replace(regex, 'Zona Industrial');
	regex = /\sZ\s/giu;
	thisString = thisString.replace(regex, ' Zona ');
	regex = /\bCC\b/giu;
	thisString = thisString.replace(regex, 'Centro Comercial');
	regex = /\b(P[o]?[.]?(s|st|sto)?[.]?)([\s]?Abast[^\s]*)/giu;
	thisString = thisString.replace(regex, 'Posto de Abastecimento');
	regex = /\b(P[o]?[.]?(s|st|sto)?[.]?)\s(?=Comb)/giu;
	thisString = thisString.replace(regex, 'Posto de ');
	regex = /(?<=de)\sComb([uú]s)?[t]?([íi]v)?[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, ' Combustível ');
	regex = /\b(P[o]?[.]?(s|st|sto)?[.]?)([\s]?Comb([uú]st)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Posto de Combustível ');
	regex = /\b(C(e|en|ent|tro)?[.]?)(\sSa[úu][d]?[e]?)/giu;
	thisString = thisString.replace(regex, 'Centro de Saúde');
	regex = /\bU[.]?S[.]?F\b/giu;
	thisString = thisString.replace(regex, 'Unidade de Saúde');
	regex = /\b(C(e|en|ent|tro)?[.]?)(\s)(?=Emprego)/giu;
	thisString = thisString.replace(regex, 'Centro de ');
	regex = /\b(C(e|en|ent|tro)?[.]?)(\s)(?=Empres|Comun|Oncol|Acolh)/giu;
	thisString = thisString.replace(regex, 'Centro ');
	regex = /\b(C(e|en|ent|tro)?[.]?)(\s)(de\s)?(?=Jard|Ref|Paroq|Jog)/giu;
	thisString = thisString.replace(regex, 'Centro ');
	regex = /\b(Ctro[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Centro');
	regex = /\b(Comun[i]?[t]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Comunitário ');
	regex = /\b(C[.]?)(\s)(?=Bra)/giu;
	thisString = thisString.replace(regex, 'Cása ');
	regex = /\b(C(m|p|am|mp|ampo)?[.]?)(\s)(?=Peq|Grand)/giu;
	thisString = thisString.replace(regex, 'Campo ');
	regex = /\b(C(ais)?[.]?)(\s)*(do)?(\s)*(?=Sodr)/giu;
	thisString = thisString.replace(regex, 'Cais do ');
	regex = /\bEmpres[.]?\b/giu;
	thisString = thisString.replace(regex, 'Empresarial');
	regex = /\bEscrit[.]?(\s|$|\(|\))/giu;
	thisString = thisString.replace(regex, 'Escritórios ');
	regex = /\bL[o]?j[.]?\s/giu;
	thisString = thisString.replace(regex, 'Lója ');
	regex = /\bSolid([áa]r)?[.]?\s/giu;
	thisString = thisString.replace(regex, 'Solidária ');
	regex = /\bJardm\b/giu;
	thisString = thisString.replace(regex, 'Jardim');
	regex = /\bMirad\b/giu;
	thisString = thisString.replace(regex, 'Miradouro');
	regex = /\bMiseric([óo]rd)?(\s|\)|\(|$)/giu;
	thisString = thisString.replace(regex, 'Misericórdia ');
	regex = /(?<=((Bairro)|B[oº]?))[.]?\sCtt\b/giu;
	thisString = thisString.replace(regex, ' dos C.T.T.');
	regex = /\bCtt\b/giu;
	thisString = thisString.replace(regex, 'Correios ');
	regex = /\b(Cgd|Bcp)\b/giu;
	thisString = thisString.replace(regex, 'Banco ');
	regex = /\bC[\s]*[.]?p[\s]*[.]?\b/giu;
	thisString = thisString.replace(regex, 'Combóios ');
	regex = /\bSMAS\b/giu;
	thisString = thisString.replace(regex, ' Serviços Municipalizados');
	regex = /\bServ[\s]+Op\b/giu;
	thisString = thisString.replace(regex, ' Serviços Operacionais ');
	regex = /\bInst(itut)?\b/giu;
	thisString = thisString.replace(regex, 'Instituto');
	regex = /\bCab\s+(?=Luz|Pt)/giu;
	thisString = thisString.replace(regex, 'Cábine ');
	regex = /\bGNR\b/giu;
	thisString = thisString.replace(regex, 'Guárda Republicana');
	regex = /\bPSP\b/giu;
	thisString = thisString.replace(regex, 'Polícia');
	regex = /\bUnid\b/giu;
	thisString = thisString.replace(regex, 'Unidade');
	regex = /\bFarm([aá]c)?[.]?(\s|$|\/)/giu;
	thisString = thisString.replace(regex, 'Farmácia ');
	regex = /\b(Ter([m]?|mi|min)[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Terminál ');
	regex = /\b(Merc[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Mercado ');
	regex = /\b(Hot[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Hotel ');
	regex = /\b(Vet[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Veterinário ');
	regex = /\b(Comp[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Complexo ');
	regex = /\b(Intern[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Internacional ');
	regex = /\b(Superm(erc)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Súper-mercádo ');
	regex = /\b(Paral[.]?)\s/giu;
	thisString = thisString.replace(regex, 'Paralélo ');
	regex = /\b(Prin[c]?(cip)?[.]?)\s/giu;
	thisString = thisString.replace(regex, 'Príncipal ');
	regex = /\b(Polidesp[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Polidesportivo ');
	regex = /\b(Tap[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Tapada ');
	/* Localities */
	regex = /\b(Alc[^âa](ch)?[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Álcochete');
	regex = /\b(Alf[^â](ag)?[.]?)\s(?!Din|Cun)/giu;
	thisString = thisString.replace(regex, 'Álfragide ');
	regex = /\s(F[.]?)\s(?=Fomento)/giu;
	thisString = thisString.replace(regex, ' Fundo ');
	regex = /\b(F[.]?)\s(da\s)?(?=Telha)/giu;
	thisString = thisString.replace(regex, 'Fonte da ');
	regex = /\b(Almei[d]?[.]?)\b/giu;
	thisString = thisString.replace(regex, 'Almeida');
	regex = /\bP(in)?[.]?\sFrad(es)?(\s|$)/giu;
	thisString = thisString.replace(regex, 'Pinhal de Frades ');
	regex = /\bP(in)?(hal)?[.]?\sGen(er)?(al)?(\s|$)/giu;
	thisString = thisString.replace(regex, 'Pinhal do General ');
	regex = /^(\s)*P(in)?(hal)?[.]?\sC\sCunha(\s|$)/giu;
	thisString = thisString.replace(regex, 'Pinhal do Conde da Cunha ');
	regex = /\bP(in)?(hal)?[.]?\sNov[o]?(\s|$)/giu;
	thisString = thisString.replace(regex, 'Pinhal Novo ');
	regex = /(\s|^)A[.]?\sBonecos(\s|$)/giu;
	thisString = thisString.replace(regex, ' Alto dos Bonecos ');
	regex = /\bP[.]?\s(?=Pires)/giu;
	thisString = thisString.replace(regex, ' Paio ');
	regex = /\bR[ée]p[.]?(\s|$|\))/giu;
	thisString = thisString.replace(regex, ' República ');
	regex = /\bCs[l]?\b/giu;
	thisString = thisString.replace(regex, 'Casal');
	regex = /\b(C[.\s]*)(?=Camb)/giu;
	thisString = thisString.replace(regex, 'Casal ');
	regex = /\b(G[.\s]*)(?=Junq)/giu;
	thisString = thisString.replace(regex, 'Guerra ');
	regex = /\b(G[.\s]*)(de[\s]*)?(?=Ort)/giu;
	thisString = thisString.replace(regex, 'Garcia de ');
	regex = /\b(Com(bat)?[^\s]*[\s]Gr[^\s]*[\s]G[^\s]*)\b/giu;
	thisString = thisString.replace(regex, 'Combatentes da Grande Guerra');
	regex = /\bCombat\b/giu;
	thisString = thisString.replace(regex, 'Combatentes');
	regex = /\b(Mov[^\s]*[\s]F[^\s]*[\s]Arm[^\s]*)\b/giu;
	thisString = thisString.replace(regex, 'Movimento das Forças Armadas');
	regex = /\bF(or)?([cç]as)?[^\s]*[\s]+Arm[^\s]*\b/giu;
	thisString = thisString.replace(regex, 'Forças Armadas');
	regex = /\bF(or)?([cç]a)?[^\s]*[\s]+A[ée]r(ea)?[\s]*P(or)?t(ug)?\b/giu;
	thisString = thisString.replace(regex, 'Força Aérea Portuguesa');
	regex = /\bF[^\s]*[\s]+A[ée]r(ea)?\b/giu;
	thisString = thisString.replace(regex, 'Força Aérea');
	regex = /\bFuz[^\s]*[\s]+Nav(a)?(ai)?(ais)?\b/giu;
	thisString = thisString.replace(regex, 'Fuzileiros Navais');
	regex = /\bEcom\b/giu;
	thisString = thisString.replace(regex, 'Ecomuseu');
	regex = /(?<=s)[\s]+[AÁ]g(\s|$)/giu;
	thisString = thisString.replace(regex, 'Águas ');
	regex = /\b[AÁ]g(\s|$)/giu;
	thisString = thisString.replace(regex, 'Água ');
	regex = /\bM[.\s]*F[.\s]*A[.\s]*\b/giu;
	thisString = thisString.replace(regex, 'M. F. A.');
	regex = /\b(C[o]?v[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Cóva ');
	regex = /\b(Oei[r]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Óeiras');
	regex = /\b(Morad[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Moradores ');
	regex = /\b(Trab[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Trabalhadores ');
	regex = /\b(C[.]?)\s(?=Pau)/giu;
	thisString = thisString.replace(regex, 'Cruz ');
	regex = /\b(B[.]?)\s*(?=Esperan)/giu;
	thisString = thisString.replace(regex, 'Boa ');
	regex = /\b(A[l]?[d]?[.]?)\s(?=Meco)/giu;
	thisString = thisString.replace(regex, 'Aldeia do ');
	regex = /\b(Ch(ar)?(neca)?[.]?)(\sCap[a]?r?(ica)?[.]?)(\s|\()/giu;
	thisString = thisString.replace(regex, 'Charnéca de Caparíca ');
	regex = /\b(Ch(ar)?(neca)?[.]?)(\sCot[o]?[v]?(ia)?[.]?)/giu;
	thisString = thisString.replace(regex, 'Charnéca da Cotovia ');
	regex = /\b(C(osta)?[.]?)(\sCap[a]?(rica)?[.]?)(\s|\()/giu;
	thisString = thisString.replace(regex, 'Costa da Caparíca ');
	regex = /\b(M[o]?[n]?(te)?[.]?)(\sCap[a]?(rica)?[.]?)(\s|\()/giu;
	thisString = thisString.replace(regex, 'Monte de Caparíca ');
	regex = /\b(J(o[ãa]o)?[.]?)(\sCap[a]?(rica)?[.]?)(\s|\()/giu;
	thisString = thisString.replace(regex, 'João da Caparíca ');
	regex = /\bV(ila)?[.]?[\s]?F[r]?(esca)?[.]?[\s]?Az(eit[ãa]o)?/giu;
	thisString = thisString.replace(regex, 'Vila Fresca de Azeitão ');
	regex = /\bV(ila)?[.]?[\s]?N[o]?[g]?(ueira)?[.]?[\s]?Az(eit[ãa]o)?/giu;
	thisString = thisString.replace(regex, 'Vila Nogueira de Azeitão ');
	regex = /\bB[r]?[e]?[j]?(os)?[.]?[\s]+Az(eit[ãa]o)?/giu;
	thisString = thisString.replace(regex, 'Brejos de Azeitão ');
	regex = /\bV[e]?nd(as)?[.]?[\s]?Az(eit[ãa]o)?/giu;
	thisString = thisString.replace(regex, 'Vendas de Azeitão ');
	regex = /\bM(ar)?(c)?[.]?[\s]?Grilo/giu;
	thisString = thisString.replace(regex, 'Marco do Grilo');
	regex = /\bBaixa[.]?[\s]?Banheira\b/giu;
	thisString = thisString.replace(regex, 'Baixa da Banheira');
	regex = /\bCova[.]?[\s]?Piedade\b/giu;
	thisString = thisString.replace(regex, 'Cova da Piedade');
	regex = /\bQuinta[\s]*Conde\b/giu;
	thisString = thisString.replace(regex, 'Quinta do Conde');
	regex = /\bVenda[\s]*Pinheiro\b/giu;
	thisString = thisString.replace(regex, 'Venda do Pinheiro');
	regex = /\bM[\s]*Rolas\b/giu;
	thisString = thisString.replace(regex, 'Moínho das Rolas');
	regex = /\bB[.]?[\s]?Vista\b/giu;
	thisString = thisString.replace(regex, 'Bela Vista');
	regex = /\bP[.]?[\s]*S(an)?t(a)?[.]?[\s]*Iria\b/giu;
	thisString = thisString.replace(regex, 'Póvoa de Santa Iria');
	regex = /\bG[\s]?Bravo\b/giu;
	thisString = thisString.replace(regex, 'Gato Bravo');
	regex = /\bCor[\s]?Rosa\b/giu;
	thisString = thisString.replace(regex, 'Cor-de-Rosa');
	regex = /\bV[\s]*Flores\b/giu;
	thisString = thisString.replace(regex, 'Vale Flores');
	regex = /\bAmora/giu;
	thisString = thisString.replace(regex, 'Amóra ');
	regex = /\bF[e]?[r]?[n]?[.]?[\s](?=Ferro)/giu;
	thisString = thisString.replace(regex, 'Fernão ');
	regex = /\bA[.]?[\s]?Nec(ess)?(id)?\b/giu;
	thisString = thisString.replace(regex, 'Alto das Necessidades');
	regex = /\bLagoa[.]?[\s]+A(lb)?\b/giu;
	thisString = thisString.replace(regex, 'Lagoa de Albufeira');
	regex = /\bM[.]?[\s]?S(in)?tr[a]?\b/giu;
	thisString = thisString.replace(regex, 'Mira Sintra ');
	regex = /\b(Dep([oó]|[oó]s|[oó]si|[oó]sit)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Depósito$3');
	regex = /\bConst[.]?\b(?=[\s]*Civil)/giu;
	thisString = thisString.replace(regex, 'Construção');
	regex = /\b(Av[e]?[n]?[.]?[aª]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Avenida$2');
	regex = /(?<!Rua|Avenida|Alameda|Praceta|Travessa|Estrada)(\s|^)R[.]?(\s)/iu;
	const regex2 = /(Rua|Avenida|Alameda|Praceta|Travessa|Estrada)[\s]+[^\s)/]+[\s]+R[.]?\s/iu;
	while (thisString.match(regex) && !thisString.match(regex2)) {
		thisString = thisString.replace(regex, ' Rua$2');
	}
	regex = /\b(Desp[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Desportivo$2');
	regex = /\b(Pav[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Pavilhão ');
	regex = /\b(P[a]?[v]?[.]?)\s(?=(D[e]?sp|Mult))/giu;
	thisString = thisString.replace(regex, 'Pavilhão ');
	regex = /(?<!C\s|Costa\s|Mte\s|Monte\s|Jo[ãa]o\s)\b(Cap[.]?)\s/giu;
	thisString = thisString.replace(regex, 'Capitão ');
	regex = /\b(Inf[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Infante$2');
	regex = /\b(Mal[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Marechal$2');
	regex = /\b(Gen[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'General$2');
	regex = /\b(Asp[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Aspirante$2');
	regex = /\b(Maj[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Majór$2');
	regex = /\b(Cel[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Coronél$2');
	regex = /\b(Ten[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Tenente$2');
	regex = /\b(Desemb(arg)?[.]?)(\s|\))/giu;
	thisString = thisString.replace(regex, 'Desembargador$3');
	regex = /\b(Sarg[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Sargento$2');
	regex = /\b(Brig[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Brigadeiro$2');
	regex = /\b(Dq[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Duque$2');
	regex = /(?<=Hosp)((.)*?(\s|\(|\)))Cons[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, '$1 Consultas ');
	regex = /\b(Con[s]?[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Conselheiro ');
	regex = /\b(Corr[.]?)(\s)(?!Ext)/giu;
	thisString = thisString.replace(regex, 'Corregedor ');
	regex = /\b(Consig[l]?[.]?)\s(?=Pedr)/giu;
	thisString = thisString.replace(regex, 'Consilhiéri ');
	regex = /\bConsiglieri\b/giu;
	thisString = thisString.replace(regex, 'Consilhiéri');
	regex = /\b(Mq[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Marquês$2');
	regex = /\b(C[o]?m[^\s]?[d]?[t][e]?[.]?)\s/giu;
	thisString = thisString.replace(regex, 'Comandante ');
	regex = /\b(C[o]?m[^\s]?[d][t]?[e]?[.]?)\s/giu;
	thisString = thisString.replace(regex, 'Comandante ');
	regex = /(?<!Cruzamento\s)\b(Com[.]?(\s|$|\)|\())/giu;
	thisString = thisString.replace(regex, 'Comandante ');
	regex = /\b(Visc[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Visconde$2');
	regex = /\b(Poe[.]?)(\s)/giu;
	thisString = thisString.replace(regex, 'Poeta$2');
	regex = /\b(Esp([íi]r)?[.]?)(\s)(?=S)/giu;
	thisString = thisString.replace(regex, 'Espírito ');
	regex = /\b(B[e]?[n]?[t]?[o]?[.]?)(\s)+(de)?(\s)*(J[e]?[u]?[s]?[.]?)(\s)+(?=Car)/giu;
	thisString = thisString.replace(regex, 'Bento de Jesus ');
	regex = /\b(B(to)?[.]?)(\s)(de\s)?(?=Jesus)/giu;
	thisString = thisString.replace(regex, 'Bento de ');
	regex = /\b(S(ou)?[s]?[.]?)(\s)?(?=Mend)/giu;
	thisString = thisString.replace(regex, 'Sousa ');
	regex = /\b(R(a)?[úu]?[.]?)(\s)?(?=Soln)/giu;
	thisString = thisString.replace(regex, 'Raúl ');
	regex = /\b(E[g]?[a]?[.]?)(\s)+(?=Mon)/giu;
	thisString = thisString.replace(regex, 'Égas ');
	regex = /\b(Lib[.]?)(\s)+(?=Galv)/giu;
	thisString = thisString.replace(regex, 'Libânia ');
	regex = /\b(Lib(er)?[.]?)(\s)+(?=Timor)/giu;
	thisString = thisString.replace(regex, 'Libertadores de ');
	regex = /\b(B(rand)?[.]?)(\s)+(?=Vasc)/giu;
	thisString = thisString.replace(regex, 'Brandão ');
	regex = /\sVasc\b/giu;
	thisString = thisString.replace(regex, ' Vasconcelos');
	regex = /\bLor(o)?(sae)?\b/giu;
	thisString = thisString.replace(regex, ' Loro Sae ');
	regex = /\bT\s*(?=Lor)/giu;
	thisString = thisString.replace(regex, 'Timor ');
	regex = /\b(Lib(er)?[d]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Liberdade ');
	regex = /\bTrind(\s|$)/giu;
	thisString = thisString.replace(regex, 'Trindade ');
	regex = /\bLocalid\b/giu;
	thisString = thisString.replace(regex, 'Localidade');
	regex = /\bQuinta(\s)*Conde\b/giu;
	thisString = thisString.replace(regex, 'Quinta do Conde');
	regex = /(?<=Egas\s)\s*\bM[o]?[n]?\s/giu;
	thisString = thisString.replace(regex, 'Moniz ');
	regex = /\b(C[a]?[l]?[.]?)[\s]+(?=Gulb)/giu;
	thisString = thisString.replace(regex, 'Calouste ');
	regex = /(?<=Calouste)[\s]+G(ulb|ulbenk)?\b/giu;
	thisString = thisString.replace(regex, ' Gulbenkian');
	regex = /\b(M[a]?[n]?[.]?)[\s]+(?=Alped)/giu;
	thisString = thisString.replace(regex, 'Manuel ');
	regex = /(?<=Manuel)[\s]+Alped(r|rinh)?\b/giu;
	thisString = thisString.replace(regex, ' Alpedrinha');
	regex = /\b(L[uú]?[íi]?[sz]?[.]?)(\s)(?=Cam)/giu;
	thisString = thisString.replace(regex, 'Luís ');
	regex = /(?<=Luís)[\s]*(de)?[\s]*Cam[õo]?(e)?[s]?[.]?\b/giu;
	thisString = thisString.replace(regex, ' de Camões');
	regex = /\bVasco[\s]*Gama\b/giu;
	thisString = thisString.replace(regex, 'Vasco da Gama');
	regex = /\bComercian\b/giu;
	thisString = thisString.replace(regex, 'Comerciantes');
	regex = /\bNaveg\b/giu;
	thisString = thisString.replace(regex, 'Navegantes');
	regex = /\bDescobrim\b/giu;
	thisString = thisString.replace(regex, 'Descobrimentos');
	regex = /\bAlgaz\b/giu;
	thisString = thisString.replace(regex, 'Algazarra');
	regex = /\bDoming\b/giu;
	thisString = thisString.replace(regex, 'Domingos');
	regex = /\bEucalip\b/giu;
	thisString = thisString.replace(regex, 'Eucaliptos');
	regex = /\bLat\b/giu;
	thisString = thisString.replace(regex, 'Latino');
	regex = /\bMouz\b/giu;
	thisString = thisString.replace(regex, 'Mouzinho');
	regex = /\bF\s*(?=Silvest)/giu;
	thisString = thisString.replace(regex, 'Francisco ');
	regex = /\bSilvest\b/giu;
	thisString = thisString.replace(regex, 'Silvestre');
	regex = /\bLenc\b/giu;
	thisString = thisString.replace(regex, 'Lencastre');
	regex = /\bMacolid\b/giu;
	thisString = thisString.replace(regex, 'Macolide');
	regex = /\b(Pólv[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Pólvora ');
	regex = /\b(F(er)?)(\s)*(de)?(\s)*(?=Magal)/giu;
	thisString = thisString.replace(regex, 'Fernão de ');
	regex = /(?<=Fernão\sde|Fernão)\s*Magal\b/giu;
	thisString = thisString.replace(regex, ' Magalhães');
	regex = /\bSaram\b/giu;
	thisString = thisString.replace(regex, 'Saramago');
	regex = /\bSoeir\b/giu;
	thisString = thisString.replace(regex, 'Soeiro');
	regex = /\bVer[íi]ss\b/giu;
	thisString = thisString.replace(regex, 'Veríssimo');
	regex = /\b(A(m)?(m[áa])?)(\s)+(?=Rodrigu)/giu;
	thisString = thisString.replace(regex, 'Amália ');
	regex = /\b(S(ac)?)(\s)*(?=Cab)/giu;
	thisString = thisString.replace(regex, 'Sacadura ');
	regex = /\b(P(e)?(ed)?(Pedr)?)(\s)*(?=[ÁA]lv)/giu;
	thisString = thisString.replace(regex, 'Pedro ');
	regex = /\b(?<=Pedro)(\s)*[ÁA](l)?(lv)?(lva)?(lvar)?(\s)*(?=C)/giu;
	thisString = thisString.replace(regex, ' Álvares ');
	regex = /\b(?<=Sacadura|Álvares)(\s)*C(ab)?[r]?[l]?(\s|$)/giu;
	thisString = thisString.replace(regex, ' Cabral ');
	regex = /\b(Re(s)?(si)?(sis)?(sist)?(siste)?(sisten)?(sistent)?)(\s)*(?=Antifa)/giu;
	thisString = thisString.replace(regex, 'Resistentes ');
	regex = /\b(?<=Resistente[s]?)(\s)*Antifa(s)?(sc)?(sci)?(scis)?(scist)?(\s|$)/giu;
	thisString = thisString.replace(regex, ' Antifascistas ');
	regex = /\b(B[o]?[r]?[d]?[.]?)(\s)(?=Pin)/giu;
	thisString = thisString.replace(regex, 'Bordalo ');
	regex = /(?<=Bordalo)[\s]*P(in)?[h]?(ei)?[r]?[.]?\b/giu;
	thisString = thisString.replace(regex, ' Pinheiro');
	regex = /\bM(ar)?[q]?[.]?[\s]+(de)?(\s)*(?=Pombal)/giu;
	thisString = thisString.replace(regex, 'Marquês de ');
	regex = /\bMarqu[eê]s(\s)+(?=Pombal)/giu;
	thisString = thisString.replace(regex, 'Marquês de ');
	regex = /(?<=Gago|Magalh[aã]es)[\s]*C(ou)?[t]?[i]?(nh)?[o]?[.]?\b/giu;
	thisString = thisString.replace(regex, ' Coutinho');
	regex = /\sG(a|ag)?(\s)*(?=Cout)/giu;
	thisString = thisString.replace(regex, ' Gago ');
	regex = /\s(Alf[r]?[.]?)(\s|$|\))/giu;
	thisString = thisString.replace(regex, ' Alfredo ');
	regex = /(?<=Alfredo)[\s]*Vit[.]?\s/giu;
	thisString = thisString.replace(regex, ' Vitorino ');
	regex = /\bFel[\s]*(?=Castil)/giu;
	thisString = thisString.replace(regex, 'Feliciano de ');
	regex = /\bCoe\b/giu;
	thisString = thisString.replace(regex, 'Coelho');
	regex = /\bTras[.]?(\s)/giu;
	thisString = thisString.replace(regex, 'Traseiras ');
	regex = /\bDps[.]?(\s)/giu;
	thisString = thisString.replace(regex, 'Depois ');
	regex = /\bJto[.]?(\s)/giu;
	thisString = thisString.replace(regex, 'Junto ');
	regex = /\bBx[.]?\b/giu;
	thisString = thisString.replace(regex, 'Baixo');
	regex = /\bCim[.]?\b/giu;
	thisString = thisString.replace(regex, 'Cima');
	regex = /\bDesc[.]?(\s)/giu;
	thisString = thisString.replace(regex, 'Descida ');
	regex = /\bSup[.]?(\s)/giu;
	thisString = thisString.replace(regex, 'Superior ');
	regex = /\bPass[.]?(\s)/giu;
	thisString = thisString.replace(regex, 'Passagem ');
	regex = /(?<!Rua)(?<=[a-zA-Z])\sC\s*\(/giu;
	thisString = thisString.replace(regex, ' Cima (');
	regex = /\bAld[.]?\b/giu;
	thisString = thisString.replace(regex, 'Aldeia');
	regex = /\b(Az[i]?(nh)?[g]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Azinhaga ');
	regex = /\bCircunv[.]?\b/giu;
	thisString = thisString.replace(regex, 'Circunvalação');
	regex = /\bEstal[.]?\b/giu;
	thisString = thisString.replace(regex, 'Estaleiro');
	regex = /(?<=(Marcos|Farmácia))(\s)+PT\b/giu;
	thisString = thisString.replace(regex, ' Portugal');
	/* TTS specific optimizations */
	regex = /cç(?=[ãaoõ])/giu;
	thisString = thisString.replace(regex, 'ç');
	regex = /(?<=[a])ct(?=[o])/giu;
	thisString = thisString.replace(regex, 't');
	regex = /ribatejo/giu;
	thisString = thisString.replace(regex, 'riba-tejo');
	regex = /miratejo/giu;
	thisString = thisString.replace(regex, 'mira-tejo');
	regex = /\b([\w]+)tejo\b/giu;
	thisString = thisString.replace(regex, '$1-tejo');
	regex = /\bCastelinhos\b/giu;
	thisString = thisString.replace(regex, 'Castlinhos');
	regex = /\bPai[oõ]es/giu;
	thisString = thisString.replace(regex, 'Pãe-iões');
	regex = /\bColaride\b/giu;
	thisString = thisString.replace(regex, 'Colarid');
	regex = /Coina/giu;
	thisString = thisString.replace(regex, 'Coin-a');
	regex = /\bBotequim\b/giu;
	thisString = thisString.replace(regex, 'Butequim');
	regex = /Euf[ée]mia/giu;
	thisString = thisString.replace(regex, 'Eufémi-a');
	regex = /\bPacheca\b/giu;
	thisString = thisString.replace(regex, 'Pachêca');
	regex = /\bGarret\b/giu;
	thisString = thisString.replace(regex, 'Garrett');
	regex = /\bAida\b/giu;
	thisString = thisString.replace(regex, 'Ai-da');
	regex = /\bPinteus\b/giu;
	thisString = thisString.replace(regex, 'Pintéus');
	regex = /\bMalmequeres\b/giu;
	thisString = thisString.replace(regex, 'Mal-me-queres');
	regex = /\bAboboda\b/giu;
	thisString = thisString.replace(regex, 'Abóboda');
	regex = /\bBasica\b/giu;
	thisString = thisString.replace(regex, 'Básica');
	regex = /\bRemôa\b/giu;
	thisString = thisString.replace(regex, 'Remoua');
	regex = /\bFisgas\b/giu;
	thisString = thisString.replace(regex, 'Fisga-as');
	regex = /\bIvens\b/giu;
	thisString = thisString.replace(regex, 'Ívens');
	regex = /\bSales\b/giu;
	thisString = thisString.replace(regex, 'Sáles');
	regex = /\bPôpa\b/giu;
	thisString = thisString.replace(regex, 'Popa');
	regex = /Curry/giu;
	thisString = thisString.replace(regex, 'Cú-ri');
	regex = /\bOutão/giu;
	thisString = thisString.replace(regex, 'Ou-tão');
	regex = /Eugene/giu;
	thisString = thisString.replace(regex, 'Eugeene');
	regex = /\bAida\b/giu;
	thisString = thisString.replace(regex, 'Ai-da');
	regex = /Prior/giu;
	thisString = thisString.replace(regex, 'Pri-oure');
	regex = /Saida/giu;
	thisString = thisString.replace(regex, 'Saída');
	regex = /Ameixoeira/giu;
	thisString = thisString.replace(regex, 'Ameixo-eira');
	regex = /Carmona/giu;
	thisString = thisString.replace(regex, 'Cármona');
	regex = /Esteval/giu;
	thisString = thisString.replace(regex, 'Estevál');
	regex = /Zambujeiro/giu;
	thisString = thisString.replace(regex, 'Zam-bujeiro');
	regex = /Afonsoeiro/giu;
	thisString = thisString.replace(regex, 'Afonso-eiro');
	regex = /Piedense/giu;
	thisString = thisString.replace(regex, 'Piédense');
	regex = /Murfac[eé]m/giu;
	thisString = thisString.replace(regex, 'Murfácém');
	regex = /samouco/giu;
	thisString = thisString.replace(regex, 'Sá-mouco');
	regex = /Almoçageme/giu;
	thisString = thisString.replace(regex, 'Almuça-geme');
	regex = /\bc[ée]sar\b/giu;
	thisString = thisString.replace(regex, 'Césár');
	regex = /\bBowling\b/giu;
	thisString = thisString.replace(regex, 'Bólíng');
	regex = /\bSapec\b/giu;
	thisString = thisString.replace(regex, 'Sápec');
	regex = /abraão/giu;
	thisString = thisString.replace(regex, 'Abrão');
	regex = /\bSodre\b/giu;
	thisString = thisString.replace(regex, 'Sodré');
	regex = /(?<=Lagoa|Venda)\s+Seca\b/giu;
	thisString = thisString.replace(regex, ' Sêca');
	regex = /\bQueijas\b/giu;
	thisString = thisString.replace(regex, 'Queijâs');
	regex = /\bPolima\b/giu;
	thisString = thisString.replace(regex, 'Pulimmâ');
	regex = /\bAgueira\b/giu;
	thisString = thisString.replace(regex, 'A-gueira');
	regex = /Peg[oõ]es/giu;
	thisString = thisString.replace(regex, 'Pé-gões');
	regex = /\bEste\b/giu;
	thisString = thisString.replace(regex, 'És-te');
	regex = /\bFomega\b/giu;
	thisString = thisString.replace(regex, 'Fómega');
	regex = /\bFreixial\b/giu;
	thisString = thisString.replace(regex, 'Frei-xial');
	regex = /\bCoelheiras\b/giu;
	thisString = thisString.replace(regex, 'Coêlhêras');
	regex = /\bRepublica\b/giu;
	thisString = thisString.replace(regex, 'República');
	regex = /\bRep[úu]b(l)?\b/giu;
	thisString = thisString.replace(regex, 'República');
	regex = /Linda-a-velha/giu;
	thisString = thisString.replace(regex, 'Linda-á-Velha');
	regex = /Monta[\s]*chique/giu;
	thisString = thisString.replace(regex, 'Montáchique');
	regex = /\bEsta[çc][aã]o\b/giu;
	thisString = thisString.replace(regex, '- Estaçaão ');
	regex = /\bFarmacia\b/giu;
	thisString = thisString.replace(regex, 'Farmácia');
	regex = /\bInspector\b/giu;
	thisString = thisString.replace(regex, 'Inspétor');
	regex = /\bOrquideas\b/giu;
	thisString = thisString.replace(regex, 'Orquídeas');
	regex = /\bLeroy Merlin\b/giu;
	thisString = thisString.replace(regex, 'Lerruá Merre-lan');
	/* Leave towards all unmatched lonely C */
	regex = /(^|\()[\s]?C[.]?\s(?!C\s)/giu;
	thisString = thisString.replace(regex, '$1 Casal ');
	/* Celsius correction */
	regex = /\s[A](\s|$)/giu;
	thisString = thisString.replace(regex, ' Á ');
	regex = /\s[E]\s*(\)|$|-)/giu;
	thisString = thisString.replace(regex, ' É ');
	regex = /(?<=[\d])\s*[C](\s|$)/giu;
	thisString = thisString.replace(regex, ' Cê ');
	regex = /(^|\(|\s)[C](\s|$)/giu;
	thisString = thisString.replace(regex, ' Cê ');
	/* Resolve Nova/Novo */
	regex = /(?<=a)(\s)+(Nv[.]?[aª]?)\b/giu;
	thisString = thisString.replace(regex, ' Nova');
	regex = /(?<=Urbanização)(\s)+(Nv[.]?[aª]?)\b/giu;
	thisString = thisString.replace(regex, ' Nova');
	regex = /(?<=o)(\s)+(Nv[.]?)\b/giu;
	thisString = thisString.replace(regex, ' Novo');
	regex = /(?<=Monte)(\s)+(Nv[.]?)\b/giu;
	thisString = thisString.replace(regex, ' Novo');
	/* Resolve common name abbreviations to determine gramatical gender */
	regex = /\b(M[.]?[ªa])(\s|$)/giu;
	thisString = thisString.replace(regex, 'Maria ');
	regex = /\b(M[.]?)\s(?=Ana)/giu;
	thisString = thisString.replace(regex, 'Maria ');
	regex = /\b(Hel[ªa]?[.]?[ªa]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Helena ');
	regex = /\b(Virg(in)?[ªa]?[.]?[ªa]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Virgínia ');
	regex = /\b(Ant[oº]?[.]?[oº]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'António ');
	regex = /\b(Ant[oº]?[.]?[oº]?)$/giu;
	thisString = thisString.replace(regex, 'António ');
	regex = /\bAntonio\b/giu;
	thisString = thisString.replace(regex, 'António');
	regex = /\bAnast(?=\s|$)/giu;
	thisString = thisString.replace(regex, 'Anastácio');
	regex = /\s([ÁA]lv[.]?)\s(?=Per)/giu;
	thisString = thisString.replace(regex, ' Álvares ');
	regex = /\s([ÁA]lv[oº]?[.]?[oº]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Álvaro ');
	regex = /\s(J[oº]?[.]?[oº]?)(\s)(?=Ba[p]?t)/giu;
	thisString = thisString.replace(regex, ' João ');
	regex = /\s(J[.]?)(\s)(?=Saram|Malhoa)/giu;
	thisString = thisString.replace(regex, ' José ');
	regex = /\b(Joaq[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Joaquim ');
	regex = /\b(Af[.]?[oº]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Afonso ');
	regex = /\b(Alb[e]?[r]?[t]?[.]?[oº]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Alberto ');
	regex = /\b(Albuq[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Albuquerque ');
	regex = /\b(Petró[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Petrónio ');
	regex = /\b(Afonso\s)(Henr[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Afonso Henriques ');
	regex = /\b(Henr[i]?[q]?[.]?)\s/giu;
	thisString = thisString.replace(regex, 'Henrique ');
	regex = /\b(Vic[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Vicente ');
	regex = /\b(Card[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Cardoso ');
	regex = /\b(Man[u]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Manuel ');
	regex = /\b(Isid[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Isidoro ');
	regex = /\s(Per[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Pereira ');
	regex = /\b(Xa[v]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Xavier ');
	regex = /\b(Fran[c]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Francisco ');
	regex = /\b(Teix[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Teixeira ');
	regex = /\b(Fred[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Frederico ');
	regex = /\b(Lourei[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Loureiro ');
	regex = /\b(Fer[n]?(an)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Fernando ');
	regex = /\b(Faust[i]?[n]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Faustino ');
	regex = /(H[.]?)\s(?=Del)/giu;
	thisString = thisString.replace(regex, ' Humberto ');
	regex = /\b(Hum[b]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Humberto ');
	regex = /(?<=Humberto)(\s)*(Del[g]?[.]?)\b/giu;
	thisString = thisString.replace(regex, ' Delgado');
	regex = /\b(G[.]?)(\s)+(?=Humb)/giu;
	thisString = thisString.replace(regex, 'General ');
	regex = /\b(Alex[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, 'Alexandre ');
	regex = /(?<=Alexandre)[\s]*(Hercul[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Herculano ');
	regex = /\s(Rob[e]?[r]?[t]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Roberto ');
	regex = /\s(Seq[.]?)\b/giu;
	thisString = thisString.replace(regex, ' Sequeira');
	regex = /(?<!M)\s*(Gui(lh)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Guilherme ');
	regex = /(?<=M)\s*(Gui(lh)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Guilhermina ');
	regex = /\s(Gar[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Garcia ');
	regex = /\s(Bart(ol)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Bartolomeu ');
	regex = /\s(Andr[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' André ');
	regex = /\s(Florb[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Florbela ');
	regex = /\s(Madal[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Madalena ');
	regex = /\s(Felic[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Feliciano ');
	regex = /\s(Aug[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Augusto ');
	regex = /\s(Quir[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Quirino ');
	regex = /\s(Celest[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Celestino ');
	regex = /\s(Rod[r]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Rodrigo ');
	regex = /\s(Ferr[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Ferreira ');
	regex = /\s(Marq[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Marques ');
	regex = /\s(Rib[.]?)(\s|$|\))/giu;
	thisString = thisString.replace(regex, ' Ribeiro ');
	regex = /\s(Reb[.]?)(\s|$|\))/giu;
	thisString = thisString.replace(regex, ' Rebelo ');
	regex = /\s(Aq[.]?)(\s|$|\))/giu;
	thisString = thisString.replace(regex, ' Aquilino ');
	regex = /\s(Conc[.]?)(\s|$|\))/giu;
	thisString = thisString.replace(regex, ' Conceição ');
	regex = /\s(Antun[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Antunes ');
	regex = /\s(Eus([eé]b)?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Eusébio ');
	regex = /\sCar[v]?[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, ' Carvalho ');
	regex = /\sSalv[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, ' Salvador ');
	regex = /\sR[óo]m[úu]?[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, ' Rómulo ');
	regex = /\sBarn[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, ' Barnabé ');
	regex = /\s(Ed[u]?[.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Eduardo ');
	regex = /\sZef[.]?(\s|$)/giu;
	thisString = thisString.replace(regex, ' Zeferino ');
	/* Resolve Dona */
	regex = /\s(D[.]?[ª]?[.]?)(\s[^\s]*[a]\b)/giu;
	thisString = thisString.replace(regex, ' Dona$2');
	regex = /\s(D[.]?[ª]?[.]?)(\s(Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes)\b)/giu;
	let thisString2 = thisString.replace(regex, ' Dona$2');
	if (thisString2 === thisString) {
		regex = /\b(D[.]?)(\s\w)/giu;
		thisString = thisString.replace(regex, 'Dom$2');
	} else {
		thisString = thisString2;
	}
	/* Resolve N Sra */
	regex = /(\sN[.]?[ª]?[.]?)\s(Sr[.]?[aª][.]?)(\s)/giu;
	thisString = thisString.replace(regex, ' Nossa Senhora$3');
	regex = /(\sN[.]?[ª]?[.]?)\s(Sr[.]?[.]?)(\s[^\s]*[a]\b)/giu;
	thisString = thisString.replace(regex, ' Nossa Senhora$3');
	regex = /(\sN[.]?[ª]?[.]?)\s(Sr[.]?[aª]?[.]?)(\s(Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes)\b)/giu;
	thisString2 = thisString.replace(regex, ' Nossa Senhora$3');
	if (thisString2 === thisString) {
		regex = /(\sN[.]?)\s(Sr[.]?)(\s\w)/giu;
		thisString = thisString.replace(regex, ' Nosso Senhor$3');
	} else {
		thisString = thisString2;
	}
	/* Resolve Sra */
	regex = /(\s|^)(Sr[.]?[aª][.]?)(\s)/giu;
	thisString = thisString.replace(regex, ' Senhora ');
	regex = /(\s|^)(Sr[.]?[.]?)(\s[^\s]*[a]\b)/giu;
	thisString = thisString.replace(regex, ' Senhora ');
	regex = /(\s|^)(Sr[.]?[aª]?[.]?)(\s(Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes)\b)/giu;
	thisString2 = thisString.replace(regex, ' Senhora ');
	if (thisString2 === thisString) {
		regex = /(\s|^)(Sr[.]?)\s(?=\w)/giu;
		thisString = thisString.replace(regex, ' Senhor ');
	} else {
		thisString = thisString2;
	}
	/* Resolve Prof Dr */
	regex = /\s(P[r]?[o]?[f]?[.]?[\s]?D[r]?[.]?[aª][.]?)(\s)/giu;
	thisString = thisString.replace(regex, ' Professora Doutora$2');
	regex = /\s(P[r]?[o]?[f]?[.]?[\s]?D[r]?[.]?[aª][.]?)(\s[^\s]*[a]\b)/giu;
	thisString = thisString.replace(regex, ' Professora Doutora$2');
	regex = /\s(P[r]?[o]?[f]?[.]?[\s]?D[r]?[.]?[aª]?[.]?)(\s(Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes)\b)/giu;
	thisString2 = thisString.replace(regex, ' Professora Doutora$2');
	if (thisString2 === thisString) {
		regex = /\s(P[r]?[o]?[f]?[.]?[\s]?D[r]?[.]?)(\s\w)/giu;
		thisString = thisString.replace(regex, ' Professor Doutor$2');
	} else {
		thisString = thisString2;
	}
	/* Resolve Prof */
	regex = /\s(P[r]?[o]?f[.]?[aª][.]?)(\s)/giu;
	thisString = thisString.replace(regex, ' Professora$2');
	regex = /\s(P[r]?[o]?f[.]?)(\s[^\s]*[a]\b)/giu;
	thisString = thisString.replace(regex, ' Professora$2');
	regex = /\s(P[r]?[o]?f[.]?[aª]?[.]?)(\s(Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes)\b)/giu;
	thisString2 = thisString.replace(regex, ' Professora$2');
	if (thisString2 === thisString) {
		regex = /\s(P[r]?[o]?f[.]?)(\s\w)/giu;
		thisString = thisString.replace(regex, ' Professor$2');
	} else {
		thisString = thisString2;
	}
	regex = /\s(Pr[.]?)(\s)/giu;
	thisString = thisString.replace(regex, ' Praça ');
	regex = /\s(P[r]?[.]?)(\s)+(?=T[áa]x)/giu;
	thisString = thisString.replace(regex, ' Praça ');
	/* Resolve Eng */
	regex = /\s(Eng[.]?[aª][.]?)(\s)/giu;
	thisString = thisString.replace(regex, ' Engenheira$2');
	regex = /\s(Eng[.]?)(\s[^\s]*[a]\b)/giu;
	thisString = thisString.replace(regex, ' Engenheira$2');
	regex = /\s(Eng[.]?[aª]?[.]?)(\s(Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes)\b)/giu;
	thisString2 = thisString.replace(regex, ' Engenheira$2');
	if (thisString2 === thisString) {
		regex = /\s(Eng[.]?)(\s\w)/giu;
		thisString = thisString.replace(regex, ' Engenheiro$2');
	} else {
		thisString = thisString2;
	}
	/* Resolve Emb */
	regex = /\s(Emb[.]?[aª][.]?)(\s)/giu;
	thisString = thisString.replace(regex, ' Embaixadora ');
	regex = /\s(Emb[.]?)(\s[^\s]*[a]\b)/giu;
	thisString = thisString.replace(regex, ' Embaixadora$2');
	regex = /\s(Emb[.]?[aª]?[.]?)(\s(Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes)\b)/giu;
	thisString2 = thisString.replace(regex, ' Embaixadora$2');
	if (thisString2 === thisString) {
		regex = /\s(Emb[.]?)(\s\w)/giu;
		thisString = thisString.replace(regex, ' Embaixador$2');
	} else {
		thisString = thisString2;
	}
	/* Resolve Dra */
	regex = /\s(Dr[.]?[aª][.]?)(\s)/giu;
	thisString = thisString.replace(regex, ' Doutora$2');
	regex = /\s(Dr[.]?[aª]?)(\s[^\s]*[a]\b)/giu;
	thisString = thisString.replace(regex, ' Doutora$2');
	regex = /\s(Dr[.]?[aª]?[.]?)(\s(Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes)\b)/giu;
	thisString2 = thisString.replace(regex, ' Doutora$2');
	if (thisString2 === thisString) {
		regex = /\s(Dr[.]?)(\s\w)/giu;
		thisString = thisString.replace(regex, ' Doutor$2');
	} else {
		thisString = thisString2;
	}
	/* Resolve Santa */
	regex = /((\s|^)S[.]?[t]?[aª][.]?)(\s|$)/giu;
	thisString = thisString.replace(regex, ' Santa$3');
	regex = /((\s|^)S[.]?[t]?[aª]?[.]?)(\s[^\s]*[a]\b)/giu;
	thisString = thisString.replace(regex, ' Santa$3');
	regex = /((\s|^)S[.]?[t]?[aª]?[.]?)(\s(Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes)\b)/giu;
	thisString2 = thisString.replace(regex, ' Santa$3');
	if (thisString2 === thisString) {
		/* Resolve São vs. Santo */
		regex = /(\s|^)(S[.]?[t][.]?[oº]?[.]?)(\s)/giu;
		thisString = thisString.replace(regex, ' Santo ');
		regex = /(\s|^)(S[.]?[t][.]?[oº]?[.]?[s][.]?)(\s)/giu;
		thisString = thisString.replace(regex, ' Santos ');
		regex = /(\s|^)(S[.]?[t]?[.]?[oº]?[.]?)[\s]+(?=[aeiou])/giu;
		thisString = thisString.replace(regex, ' Santo ');
		regex = /(\s|^)(S[.]?)[\s]+(?=[^aeiou])/giu;
		thisString = thisString.replace(regex, ' São ');
	} else {
		thisString = thisString2;
	}
	/* Resolve Roman Ordinals I-IX */
	/* Due to possible collisions with abbreviations of single letters I and V, */
	/* these have stricter criteria and will perform a bit worse to avoid collision */
	regex = /([^.]?\b)((XXI)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Vinte Um$4');
	regex = /([^.]?\b)((XX)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Vinte$4');
	regex = /([^.]?\b)((XII)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Doze$4');
	regex = /([^.]?\b)((XIII)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Treze$4');
	regex = /([^.]?\b)((XIV)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Catorze$4');
	regex = /([aª]|Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes\b)(\s(IX)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1 Nona$4');
	regex = /([^.]?\b)((IX)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Nono$4');
	regex = /([aª]|Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes\b)(\s(VIII)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1 Oitava$4');
	regex = /([^.]?\b)((VIII)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Oitavo$4');
	regex = /([aª]|Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes\b)(\s(VII)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1 Sétima$4');
	regex = /([^.]?\b)((VII)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Sétimo$4');
	regex = /([aª]|Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes\b)(\s(VI)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1 Sexta$4');
	regex = /([^.]?\b)((VI)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Sexto$4');
	regex = /([aª]|Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes\b)(\s(IV)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1 Quarta$4');
	regex = /([^.]?\b)((IV)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Quarto$4');
	regex = /([aª]|Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes\b)(\s(III)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1 Terceira$4');
	regex = /([^.]?\b)((III)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Terceiro$4');
	regex = /([aª]|Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes\b)(\s(II)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1 Segunda$4');
	regex = /([^.]?\b)((II)\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1Segundo$4');
	regex = /([aª]|Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes\b)(\s[I]\b)([^.]?)/giu;
	thisString = thisString.replace(regex, '$1 Primeira$3');
	regex = /(?<=[oº]|Manuel|Lu[íi]s|Henrique|Henriques|Jos[eé])(\s+[I]\b)([^.]?)/giu;
	thisString = thisString.replace(regex, ' Primeiro$2');
	regex = /([aª]|Isabel|Inês|Ines|Beatriz|Matilde|Gertrudes|Judite|Leonor|Lurdes\b)(\s[V])(\s|$)/giu;
	thisString = thisString.replace(regex, '$1 Quinta ');
	regex = /([oº]|Manuel|Luis|Henrique|Henriques\b)(\s[V])(\s|$)/giu;
	thisString = thisString.replace(regex, '$1 Quinto ');
	/* Replace crossings */
	regex = /[(](([^)])*)[\s]+(X)[\s]+((.)*)/giu;
	thisString = thisString.replace(regex, '( Cruzamento entre ( $1 ) e $4  ');
	regex = /(?<=[A-Za-z]\s)((?:Rua|Avenida|Alameda|Praceta|Travessa|Estrada)([^)])*)[\s]+(X)[\s]+((.)*)/giu;
	thisString = thisString.replace(regex, '( Cruzamento entre ( $1 ) e $4  )');
	regex = /(?<=^[A-Za-z\s]*)[(][\s]*((?:Rua|Avenida|Alameda|Praceta|Travessa|Estrada)([^.])*)[\s]+(X)[\s]+((.)*)/giu;
	thisString = thisString.replace(regex, '( Cruzamento entre ( $1 ) e $4  )');
	regex = /((.)*)[\s]+(X)[\s]+((.)*)/giu;
	thisString = thisString.replace(regex, 'Cruzamento entre ( $1 ) e $4 ');
	regex = /(?<=\()[\s]*(F[r]?t[e]?[.]?)\b/giu;
	thisString = thisString.replace(regex, ' Frente');
	regex = /\b(F[r]?t[e]?[.]?)\b/giu;
	thisString = thisString.replace(regex, ' ( Frente');
	regex = /(?<=Frente)\s*(?=\d)/giu;
	thisString = thisString.replace(regex, ' ao número ');
	regex = /\b([P]\s?[\d]+)(\s|$)/giu;
	thisString = thisString.replace(regex, '( $1 ) ');
	regex = /\bEDP\b/giu;
	thisString = thisString.replace(regex, 'E. D. P.');
	regex = /\bFCT\b/giu;
	thisString = thisString.replace(regex, 'F. C. T.');
	regex = /\bIc\s/giu;
	thisString = thisString.replace(regex, 'I. C. ');
	regex = /\bIts\b/giu;
	thisString = thisString.replace(regex, 'I. T. S.');
	regex = /\bIefp\b/giu;
	thisString = thisString.replace(regex, ' Centro de Emprego e Formação ');
	/* Title case */
	thisString = titleCase(thisString);
	/* Reset "e" casing */
	// thisString = thisString.replace(/\sE\s/g, ' e ');
	return thisString;
}

/* * */

function numericShortName(lineShortName) {
	// If line is not numeric, return as-is
	if (isNaN(lineShortName)) return lineShortName;

	// If line is numeric, and has 4 digits
	if (lineShortName.length === 4) {
		//
		// If digit 1 is zero also return as-is
		if (lineShortName[1] === '0') return lineShortName;

		// If digit 2 and digit 3 are both zero, also return as-is
		if (lineShortName[2] === '0' && lineShortName[3] === '0')
			return lineShortName;

		// Else, separate into two blocks (ex. [4238] -> [42] [38])
		return `${lineShortName[0]}${lineShortName[1]} ${lineShortName[2]}${lineShortName[3]}`;

		//
	}

	// Return as-is otherwise
	return lineShortName;

	//
}

/* * */

export const makeStop = (stopString, transferModes = {}) => {
	let thisString = stopString;
	thisString = createPhoneticText(thisString);
	thisString = addTransfer(thisString, transferModes);
	/* Remove underscores */
	thisString = thisString.replace(/_/g, '');
	/* Trim spaces */
	return thisString.replace(/\s+/g, ' ');
};

/* * */

export const makeLine = (lineShortName, lineLongName) => {
	const lineShortNameTts = numericShortName(lineShortName);
	const headsignTts = createPhoneticText(lineLongName);
	let thisString = `Linha ${lineShortNameTts} com percurso ${headsignTts}`;
	/* Remove underscores */
	thisString = thisString.replace(/_/g, '');
	/* Trim spaces */
	return thisString.replace(/\s+/g, ' ');
};

/* * */

export const makeRoute = (lineShortName, routeLongName) => {
	const lineShortNameTts = numericShortName(lineShortName);
	const headsignTts = createPhoneticText(routeLongName);
	let thisString = `Linha ${lineShortNameTts} com percurso ${headsignTts}`;
	/* Remove underscores */
	thisString = thisString.replace(/_/g, '');
	/* Trim spaces */
	return thisString.replace(/\s+/g, ' ');
};

/* * */

export const makePattern = (lineShortName, patternHeadsign) => {
	const lineShortNameTts = numericShortName(lineShortName);
	const headsignTts = createPhoneticText(patternHeadsign);
	let thisString = `Linha ${lineShortNameTts} com destino a ${headsignTts}`;
	/* Remove underscores */
	thisString = thisString.replace(/_/g, '');
	/* Trim spaces */
	return thisString.replace(/\s+/g, ' ');
};

/* * */

export const makeText = makeStop;
/* Backwards compatibility */
