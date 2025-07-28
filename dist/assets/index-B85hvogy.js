(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))c(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&c(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function c(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const L=document.getElementById("todo-form"),u=document.getElementById("task-input"),E=document.getElementById("priority-select"),g=document.getElementById("todo-list"),A=document.getElementById("empty-state"),B=document.getElementById("global-actions"),$=document.getElementById("clear-completed"),x=document.getElementById("mark-all-complete"),T=document.querySelectorAll(".filter-btn"),h=document.getElementById("notification"),M=document.getElementById("total-tasks"),q=document.getElementById("completed-tasks"),N=document.getElementById("remaining-tasks");let i=JSON.parse(localStorage.getItem("todos"))||[],S="all",m=null;class O{constructor(t,n="medium"){this.id=Date.now()+Math.random(),this.task=t.trim(),this.priority=n,this.completed=!1,this.createdAt=new Date,this.completedAt=null}toggle(){this.completed=!this.completed,this.completedAt=this.completed?new Date:null}update(t,n){this.task=t.trim(),this.priority=n}}document.addEventListener("DOMContentLoaded",()=>{l(),d(),F()});function F(){L.addEventListener("submit",H),T.forEach(e=>{e.addEventListener("click",t=>{R(t.target.dataset.filter)})}),$.addEventListener("click",V),x.addEventListener("click",G),document.addEventListener("keydown",Q)}function H(e){e.preventDefault();const t=u.value.trim(),n=E.value;if(!t){r("Veuillez entrer une tâche","error");return}if(t.length>100){r("La tâche ne peut pas dépasser 100 caractères","error");return}const c=new O(t,n);i.unshift(c),u.value="",E.value="medium",p(),l(),d(),r("Tâche ajoutée avec succès !"),u.focus()}function l(){const e=U();if(A.style.display=i.length===0?"block":"none",B.style.display=i.length>0?"flex":"none",g.innerHTML="",e.length===0&&i.length>0){g.innerHTML='<li class="empty-filter">Aucune tâche ne correspond au filtre sélectionné</li>';return}e.forEach(t=>{const n=K(t);g.appendChild(n)})}function K(e){const t=document.createElement("li");return t.className=`todo-item ${e.completed?"completed":""} ${e.priority}-priority`,t.dataset.id=e.id,m===e.id?t.innerHTML=P(e):t.innerHTML=D(e),j(t,e),t}function D(e){const t={high:"🔴 Haute",medium:"🟡 Moyenne",low:"🟢 Basse"};return`
        <div class="todo-checkbox ${e.completed?"checked":""}" data-action="toggle">
        </div>
        <div class="todo-content">
            <div class="todo-text ${e.completed?"completed":""}">${w(e.task)}</div>
            <div class="todo-priority">Priorité: ${t[e.priority]}</div>
        </div>
        <div class="todo-actions">
            <button class="btn btn-warning" data-action="edit">
                ✏️ Modifier
            </button>
            <button class="btn btn-danger" data-action="delete">
                🗑️ Supprimer
            </button>
        </div>
    `}function P(e){return`
        <div class="todo-content" style="flex: 1;">
            <input type="text" class="todo-input" value="${w(e.task)}" maxlength="100">
            <select class="todo-priority-select">
                <option value="low" ${e.priority==="low"?"selected":""}>🟢 Basse</option>
                <option value="medium" ${e.priority==="medium"?"selected":""}>🟡 Moyenne</option>
                <option value="high" ${e.priority==="high"?"selected":""}>🔴 Haute</option>
            </select>
        </div>
        <div class="todo-actions">
            <button class="btn btn-success" data-action="save">
                ✅ Sauver
            </button>
            <button class="btn btn-outline" data-action="cancel">
                ❌ Annuler
            </button>
        </div>
    `}function j(e,t){if(e.addEventListener("click",n=>{const c=n.target.dataset.action;if(n.target.classList.contains("todo-checkbox")){b(t.id);return}switch(c){case"toggle":b(t.id);break;case"edit":z(t.id);break;case"delete":J(t.id);break;case"save":k(t.id,e);break;case"cancel":y();break}}),m===t.id){const n=e.querySelector(".todo-input");n.addEventListener("keydown",c=>{c.key==="Enter"?k(t.id,e):c.key==="Escape"&&y()}),n.focus(),n.select()}}function b(e){const t=i.find(n=>n.id===e);if(t){t.toggle(),p(),l(),d();const n=t.completed?"Tâche marquée comme terminée !":"Tâche marquée comme en cours !";r(n)}}function z(e){m=e,l()}function k(e,t){const n=t.querySelector(".todo-input"),c=t.querySelector(".todo-priority-select"),o=n.value.trim();if(!o){r("La tâche ne peut pas être vide","error");return}const s=i.find(a=>a.id===e);s&&(s.update(o,c.value),m=null,p(),l(),r("Tâche modifiée avec succès !"))}function y(){m=null,l()}function J(e){confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")&&(document.querySelector(`[data-id="${e}"]`).classList.add("removing"),setTimeout(()=>{i=i.filter(n=>n.id!==e),p(),l(),d(),r("Tâche supprimée")},300))}function V(){const e=i.filter(t=>t.completed).length;if(e===0){r("Aucune tâche terminée à supprimer","error");return}confirm(`Supprimer ${e} tâche(s) terminée(s) ?`)&&(i=i.filter(t=>!t.completed),p(),l(),d(),r(`${e} tâche(s) supprimée(s)`))}function G(){const e=i.filter(t=>!t.completed).length;if(e===0){r("Toutes les tâches sont déjà terminées","error");return}i.forEach(t=>{t.completed||t.toggle()}),p(),l(),d(),r(`${e} tâche(s) marquée(s) comme terminées !`)}function R(e){S=e,T.forEach(t=>{t.classList.toggle("active",t.dataset.filter===e)}),l()}function U(){switch(S){case"active":return i.filter(e=>!e.completed);case"completed":return i.filter(e=>e.completed);case"high":return i.filter(e=>e.priority==="high");default:return i}}function d(){const e=i.length,t=i.filter(c=>c.completed).length,n=e-t;v(M,e),v(q,t),v(N,n)}function v(e,t){const n=parseInt(e.textContent)||0;if(n===t)return;const c=t-n,o=300,s=10,a=c/s;let f=0;const I=setInterval(()=>{f++;const C=Math.round(n+a*f);e.textContent=f===s?t:C,f>=s&&clearInterval(I)},o/s)}function r(e,t="success"){h.textContent=e,h.className=`notification ${t}`,h.classList.add("show"),setTimeout(()=>{h.classList.remove("show")},3e3)}function p(){try{localStorage.setItem("todos",JSON.stringify(i))}catch(e){r("Erreur lors de la sauvegarde","error"),console.error("Erreur localStorage:",e)}}function Q(e){(e.ctrlKey||e.metaKey)&&e.key==="Enter"&&document.activeElement===u&&L.dispatchEvent(new Event("submit")),e.key==="Escape"&&m&&y(),(e.ctrlKey||e.metaKey)&&e.key==="k"&&(e.preventDefault(),u.focus())}function w(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}window.addEventListener("load",()=>{window.localStorage||r("Le stockage local n'est pas supporté","error"),i.length===0&&setTimeout(()=>{r("💡 Astuce: Utilisez Ctrl+K pour accéder rapidement au champ de saisie")},2e3),u.focus()});document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&d()});console.log(`
🎉 To-Do App Enhanced chargée !

Raccourcis clavier disponibles :
- Ctrl/Cmd + K : Focus sur le champ de saisie
- Ctrl/Cmd + Enter : Ajouter une tâche rapidement
- Escape : Annuler l'édition en cours
- Enter : Sauvegarder lors de l'édition

Fonctionnalités :
✅ Gestion des priorités
✅ Filtrage des tâches
✅ Statistiques en temps réel
✅ Sauvegarde automatique
✅ Animations fluides
✅ Interface responsive
✅ Notifications
✅ Mode édition en ligne

Version: 2.1.0
`);
