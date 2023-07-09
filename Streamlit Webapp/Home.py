import streamlit as st


st.set_page_config(page_title = 'Main Page',
                   page_icon='🏠',
                   layout = 'wide',
                   menu_items= {
                       'About' : 'An app page to show my work'
                       }
                   )

st.sidebar.success("Select another page here")

st.title('Main Page')
st.write('This app is used to showcase some of my works. Use the **:red[sidebar]** to see some of my projects.')
st.write('- You can find me on [Linkedin](https://www.linkedin.com/in/darren-chua-265879b1/)')
st.write('- Visit my [github](https://github.com/darrenCWJ) ')
st.write('- Visit my [huggingface](https://huggingface.co/newbie4000) ')
st.write('- Contact me through [email](mailto:darrenchuawj@hotmail.com)')