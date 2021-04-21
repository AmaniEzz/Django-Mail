document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Add event listener to the compose form
  document.querySelector('#compose-form').addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox('inbox');

})

function send_email(event) {
  // Modifies the default beheavor so it doesn't reload the page after submitting.
  event.preventDefault();

  // Get the required fields.
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  // Send the data to the server.
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    // Take the return data and parse it in JSON format.
    .then((response) => response.json())
    .then((result) => {
      load_mailbox("sent", result);
    })
    .catch((error) => console.log(error));
}

function compose_email() {  

    // Show compose view and hide other views
    document.querySelector("#compose-view").style.display = "block";
    document.querySelector("#emails-view").style.display = "none";
    document.querySelector("#email-view").style.display = "none";

    // Clear out composition fields
    document.querySelector("#compose-recipients").value = "";
    document.querySelector("#compose-subject").value = "";
    document.querySelector("#compose-body").value = "";
 
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // Build the mailbox page
  fetch(`/emails/${mailbox}`)
  .then((response) => response.json())
  .then((emails)=>{
    emails.forEach((email) => {
      console.log(email)
      const parent_element = document.createElement('div');
      parent_element.style.border = "2px solid black";
      parent_element.style.margin = "10px";


      const sender = document.createElement('span');
      if (mailbox === "sent") {
        sender.innerHTML  = email["recipients"].join(", ") + " ";
      }
      else {
        sender.innerHTML = email.sender;
      }
      sender.addEventListener("mouseover", () => {
        sender.style.color = "blue";    
      });
      sender.addEventListener("mouseout", () => {
        sender.style.color = "black";    
      });
      sender.style.padding = " 5px 25px 5px 5px";
      sender.style.fontWeight  = "900";
      parent_element.appendChild(sender);


      const subject = document.createElement('span');
      subject.setAttribute("id", "subject-span");
      subject.innerHTML = email.subject;
      parent_element.appendChild(subject);


      const timestamp = document.createElement('span');
      timestamp.innerHTML = email.timestamp;
      timestamp.style.float = "right";
      timestamp.style.padding = " 0px 5px 0px 0px";
      timestamp.style.color  = "gray";
      parent_element.appendChild(timestamp);

      if (email.read == true) {
        parent_element.style.background = "lightgray";
      }
      else{
        parent_element.style.background = "white";
      }
      parent_element.addEventListener('click', () => load_single_email(email["id"]));

      document.querySelector('#emails-view').append(parent_element);

    })
  })
  .catch((error) => console.error(error));

}

function load_single_email(id) {

    // Show the load_single_email and hide other views
  document.querySelector('#single-email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';


  // Build the email page
  fetch(`/emails/${id}`)
  .then((response) => response.json())
  .then((email)=>{
    document.querySelector('#sender').innerHTML = email["sender"];
    document.querySelector('#recipients').innerHTML = email["recipients"].join(", ");
    document.querySelector('#subject').innerHTML    = email["subject"];
    document.querySelector('#timestamp').innerHTML  = email["timestamp"];
    document.querySelector('#body-text').innerHTML  = email["body"];
    
    // Reply button
    document.querySelector(`#reply`).innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-reply-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.079 11.9l4.568-3.281a.719.719 0 0 0 0-1.238L9.079 4.1A.716.716 0 0 0 8 4.719V6c-1.5 0-6 0-7 8 2.5-4.5 7-4 7-4v1.281c0 .56.606.898 1.079.62z"/></svg>  Reply';
    document.querySelector(`#reply`).addEventListener('click', () => compose_reply(email));

    // Archiving and Unarchiving button
    document.querySelector(`#archive`).innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-archive-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/></svg>  ';
    if (email.archived == true){
      document.querySelector("#archive").innerHTML += "Unarchive";
    }
    else {
      document.querySelector("#archive").innerHTML += "Archive";
    }
    document.querySelector("#archive").addEventListener("click", () => {
      archive_email(email);
      load_mailbox("inbox");
    })
  })
  .catch(error => console.log(error));
 
  // Set the email to read.
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

// Function to toggle the archive status of an email.
function archive_email(email) {
  fetch(`/emails/${email["id"]}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !email["archived"]
    })
  });
}

function compose_reply(email) {  

  // Show compose view and hide other views
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email["sender"];
  document.querySelector("#compose-subject").value = ((email["subject"].match(/^(Re:)\s/)) ? email["subject"] : "Re: " + email["subject"]);
  document.querySelector('#compose-body').value = `On ${email["timestamp"]} ${email["sender"]} wrote:\n${email["body"]} \n-------------------------------------\n`;

}  
