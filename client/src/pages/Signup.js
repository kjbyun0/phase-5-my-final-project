import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Form, FormField, Input, Button, Checkbox, } from 'semantic-ui-react';

function Signup() {
    const [ isSeller, setIsSeller ] = useState(false);
    const { onSetUser } = useOutletContext();
    const navigate = useNavigate();

    const formSchema = yup.object().shape({
        name: isSeller ? yup.string().required('Must enter a name.') : null,
        firstName: !isSeller ? yup.string().required('Must enter a first name.') : null,
        lastName: !isSeller ? yup.string().required('Must enter a last name.') : null,
        username: yup.string().required('Must enter a username')
            .min(5, 'Must be between 5 and 20 characters')
            .max(20, 'Must be between 5 and 20 characters'),
        password: yup.string().required('Must enter a password')
            .min(5, 'Must be at least 5 characters long'),
        email: yup.string().matches(
            /^[A-Za-z]+[A-Za-z0-9]*\.?[A-Za-z0-9]+@[A-Za-z_\-]+\.[A-Za-z]{2,3}$/,
            'Invalid email address'
        ),
        mobile: !isSeller ? yup.string().matches(
            /^((([\(]?[0-9]{3,4}[\)]\s?)|([0-9]{3,4}[\-]))[0-9]{3,4}[\-][0-9]{4})|([0-9]{10,12})$/,
            'Mobile number is not valid'
        ) : null,
        phone: yup.string().matches(
            /^((([\(]?[0-9]{3,4}[\)]\s?)|([0-9]{3,4}[\-]))[0-9]{3,4}[\-][0-9]{4})|([0-9]{10,12})$/,
            'Phone number is not valid'
        ),
        zipCode: yup.string().matches(
            /^[0-9]{5}$/,
            'Zip code is not valid'            
        ),
    });

    const formik = useFormik({
        initialValues: {
            isSeller: isSeller,
            name: '',
            firstName: '',
            lastName: '',
            username: '',
            password: '',
            email: '',
            mobile: '',
            phone: '',
            street_1: '',
            street_2: '',
            city: '',
            state: '',
            zipCode: '',
        },
        validationSchema: formSchema,
        onSubmit: (values) => {
            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })
            .then(r => {
                r.json().then(data => {
                    if (r.ok) {
                        onSetUser(data);
                        navigate('/');
                    } else {
                        console.log("In Signup, error: ", data.message);
                        alert(`Error - New Account: ${data.message}`);
                    }
                })
            });
        },
    });

    function handleIsSellerCheck(bSeller) {
        setIsSeller(!bSeller);
        formik.setFieldValue('isSeller', !bSeller);
    }

    return (
        <div style={{width: '100%', height: '100%',}}>
            <div style={{width: '400px', height: 'auto', padding: '20px 30px', margin: '100px auto 0', 
                border: '1px solid lightgrey', borderRadius: '5px', }}>
                <h1>Create acount</h1>
                <Form onSubmit={formik.handleSubmit}>
                    <Checkbox label='Are you a seller?' 
                        checked={isSeller} onChange={() => handleIsSellerCheck(isSeller)}/>
                    <br/>
                    {
                        isSeller ?
                        <>
                            <label id='name' name='name' style={{display: 'inline-block', width: '20%', 
                                fontWeight: 'bold', }}>Name</label>
                            <Input id='name' name='name' type='text' style={{width: '80%', marginTop: '5px', }} 
                                value={formik.values.name}
                                onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {formik.errors.name && formik.touched.name ? 
                                <div style={{color: 'red', }}>{formik.errors.name}</div> : <br/>}
                        </> :
                        <>
                            <label id='firstName' name='firstName' style={{display: 'inline-block', 
                                width: '22%', fontWeight: 'bold', }}>First name</label>
                            <Input id='firstName' name='firstName' type='text' style={{width: '78%', marginTop: '5px', }} 
                                value={formik.values.firstName} 
                                onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {formik.errors.firstName && formik.touched.firstName ? 
                                <div style={{color: 'red', }}>{formik.errors.firstName}</div> : <br/>}
                            <label id='lastName' name='lastName' style={{display: 'inline-block', 
                                width: '22%', fontWeight: 'bold', }}>Last name</label>
                            <Input id='lastName' name='lastName' type='text' style={{width: '78%', marginTop: '5px', }}
                                value={formik.values.lastName} 
                                onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {formik.errors.lastName && formik.touched.lastName ? 
                                <div style={{color: 'red', }}>{formik.errors.lastName}</div> : <br/>}
                        </>
                    }
                    <label id='username' name='username' style={{display: 'inline-block', width: '22%', 
                        fontWeight: 'bold', }}>Username</label>
                    <Input id='username' name='username' type='text' style={{width: '78%', marginTop: '5px', }} 
                        value={formik.values.username} 
                        onChange={formik.handleChange} onBlur={formik.handleBlur} />
                    {formik.errors.username && formik.touched.username ? 
                        <div style={{color: 'red', }}>{formik.errors.username}</div> : <br/>}
                    <label id='password' name='password' style={{display: 'inline-block', width: '22%', 
                        fontWeight: 'bold', }}>Password</label>
                    <Input id='password' name='password' type='password' style={{width: '78%', marginTop: '5px', }}
                        value={formik.values.password} 
                        onChange={formik.handleChange} onBlur={formik.handleBlur} />
                    {formik.errors.password && formik.touched.password ? 
                        <div style={{color: 'red', }}>{formik.errors.password}</div> : <br/>}
                    <label id='email' name='email' style={{display: 'inline-block', width: '22%', 
                        fontWeight: 'bold', }}>Email</label>
                    <Input id='email' naem='email' type='text' style={{width: '78%', marginTop: '5px', }}
                        value={formik.values.email} 
                        onChange={formik.handleChange} onBlur={formik.handleBlur} />
                    {formik.errors.email && formik.touched.email ? 
                        <div style={{color: 'red', }}>{formik.errors.email}</div> : <br/>}
                    <label id='mobiel' name='mobile' style={{display: 'inline-block', width: '22%', 
                        fontWeight: 'bold', }}>Mobile</label>
                    <Input id='mobile' name='mobile' text='text' style={{width: '78%', marginTop: '5px', }} 
                        value={formik.values.mobile} 
                        onChange={formik.handleChange} onBlur={formik.handleBlur} />
                    {formik.errors.mobile && formik.touched.mobile ? 
                        <div style={{color: 'red', }}>{formik.errors.mobile}</div> : <br/>}
                    <label id='phone' name='phone' style={{display: 'inline-block', width: '22%', 
                        fontWeight: 'bold', }}>Phone</label>
                    <Input id='phone' name='phone' text='text' style={{width: '78%', marginTop: '5px', }}
                        value={formik.values.phone} 
                        onChange={formik.handleChange} onBlur={formik.handleBlur} />
                    {formik.errors.phone && formik.touched.phone ? 
                        <div style={{color: 'red', }}>{formik.errors.phone}</div> : <br/>}
                    <FormField style={{marginTop: '15px', }}>
                        <label>Address</label>
                        <Input id='street_1' name='street_1' type='text' placeholder='Street 1' 
                            style={{marginBottom: '5px', }} 
                            value={formik.values.street_1} onChange={formik.handleChange} />
                        <Input id='street_2' name='street_2' type='text' placeholder='Street 2' 
                            style={{marginBottom: '5px', }} 
                            value={formik.values.street_2} onChange={formik.handleChange} />
                        <Input id='city' name='city' type='text' placeholder='City' 
                            style={{marginBottom: '5px', }} 
                            value={formik.values.city} onChange={formik.handleChange} />
                        <Input id='state' name='state' type='text' placeholder='State' 
                            style={{marginBottom: '5px', }} 
                            value={formik.values.state} onChange={formik.handleChange} />
                        <Input id='zipCode' name='zipCode' type='text' placeholder='Zip code' 
                            style={{marginBottom: '5px', }} 
                            value={formik.values.zipCode} 
                            onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {formik.errors.zipCode && formik.touched.zipCode && 
                            <div style={{color: 'red', }}>{formik.errors.zipCode}</div>}
                    </FormField>
                    <Button type='submit' color='yellow' 
                        style={{width: '100%', marginTop: '10px', }}>Continue</Button>
                </Form>
            </div>
        </div>
    );
}

export default Signup;